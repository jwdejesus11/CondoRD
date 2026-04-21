import { 
  Injectable, 
  BadRequestException, 
  Logger, 
  UnprocessableEntityException 
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { InvoiceStatus, PaymentStatus, Prisma } from '@prisma/client';

@Injectable()
export class FinancialService {
  private readonly logger = new Logger(FinancialService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Helper de Integridad de Datos (Nivel Enterprise).
   * Clasifica la corrupción de datos como error de DOMINIO (422 Unprocessable Entity),
   * no como fallo de infraestructura (500).
   */
  private toNumber(val: any, fieldName: string): number | null {
    if (val === null || val === undefined) return null;
    
    const n = Number(val);
    
    if (!Number.isFinite(n)) {
      this.logger.error({ 
        event: 'DATA_INTEGRITY_VIOLATION', 
        field: fieldName, 
        value: val,
        severity: 'CRITICAL' 
      });

      // HTTP 422: El servidor entiende la petición, pero los datos son semánticamente incorrectos (corruptos)
      throw new UnprocessableEntityException({
        code: 'DATA_INTEGRITY_ERROR',
        field: fieldName,
        message: `Dato financiero inválido detectado en el campo '${fieldName}'. Se requiere auditoría de base de datos.`,
      });
    }
    
    return n;
  }

  async createInvoice(unitId: string, data: any) {
    try {
      const unit = await this.prisma.unit.findUnique({ where: { id: unitId }, include: { condo: true } });
      if (!unit) throw new BadRequestException('Unidad no encontrada');

      const subtotal = new Prisma.Decimal(data.subtotal || unit.cuotaMantenimiento);
      const itbis = subtotal.mul(0.18);
      const total = subtotal.add(itbis);

      return this.prisma.invoice.create({
        data: {
          unitId,
          periodo: data.periodo,
          fechaVencimiento: new Date(data.fechaVencimiento),
          subtotal,
          itbis,
          total,
          balance: total,
          estado: InvoiceStatus.PENDING,
        },
      });
    } catch (error) {
      this.logger.error({ event: 'INVOICE_CREATE_FAILED', unitId, error: error.message });
      throw error;
    }
  }

  async registerPayment(invoiceId: string, data: any) {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({ where: { id: invoiceId } });
      if (!invoice) throw new BadRequestException('Factura no encontrada');

      const montoDecimal = new Prisma.Decimal(data.monto || 0);

      if (montoDecimal.lte(0)) {
        throw new BadRequestException('El monto de pago debe ser mayor a 0');
      }

      const payment = await tx.payment.create({
        data: {
          invoiceId,
          monto: montoDecimal,
          metodoPago: data.metodoPago || 'TRANSFERENCIA',
          comprobanteUrl: data.comprobanteUrl,
          status: PaymentStatus.APPROVED, // Cambiamos directo a aprobado para este flujo
        },
      });

      const nuevoBalance = invoice.balance.sub(montoDecimal);
      const isPaid = nuevoBalance.lte(0);

      let estado: InvoiceStatus = InvoiceStatus.PENDING;
      if (isPaid) {
        estado = InvoiceStatus.PAID;
      } else if (nuevoBalance.lt(invoice.total)) {
        estado = InvoiceStatus.PARTIAL;
      }

      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          balance: nuevoBalance.lt(0) ? new Prisma.Decimal(0) : nuevoBalance,
          estado
        }
      });

      return payment;
    });
  }

  async getUnitBalance(unitId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { unitId, estado: { not: InvoiceStatus.CANCELLED } }
    });

    let balance = new Prisma.Decimal(0);
    invoices.forEach((inv) => {
      // Si el balance es 0 pero está PENDING (factura legacy creada antes de la migración), asumimos el total.
      const currentBalance = (inv.balance.eq(0) && inv.estado === InvoiceStatus.PENDING) ? inv.total : inv.balance;
      balance = balance.add(currentBalance);
    });

    return { unitId, balance: this.toNumber(balance, 'unitBalance') };
  }

  async getAllInvoices(condoId: string) {
    return this.prisma.invoice.findMany({
      where: { unit: { condoId } },
      include: { unit: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getGlobalBalance(condoId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { unit: { condoId }, estado: { not: InvoiceStatus.CANCELLED } }
    });

    let total = new Prisma.Decimal(0);
    invoices.forEach(inv => {
      // Backwards compatibility para facturas legacy
      const currentBalance = (inv.balance.eq(0) && inv.estado === InvoiceStatus.PENDING) ? inv.total : inv.balance;
      total = total.add(currentBalance);
    });

    return { total: this.toNumber(total, 'globalBalance') };
  }

  // Los demás métodos mantienen la misma lógica de prisma directa...
  async generatePeriod(condoId: string, periodo: string, userId: string = 'SYSTEM') {
    return this.prisma.$transaction(async (tx) => {
      // 1. Evitar duplicidad estructural se delega al Unique Constraint de Bases de Datos
      const results = { invoices: 0, payroll: 0 };
      const [yearStr, monthStr] = periodo.split('-');

      results.invoices = await this.generateInvoices(tx, condoId, periodo, yearStr, monthStr);
      results.payroll = await this.generatePayroll(tx, condoId, periodo, yearStr, monthStr);

      return { ok: true, message: `Período ${periodo} generado exitosamente por ${userId}`, results };
    });
  }

  private async generateInvoices(tx: any, condoId: string, periodo: string, yearStr: string, monthStr: string): Promise<number> {
    const units = await tx.unit.findMany({ where: { condoId } });
    let y = Number(yearStr);
    let m = Number(monthStr) - 1; // JS months are 0-11
    if (isNaN(y) || isNaN(m)) {
      const now = new Date();
      y = now.getFullYear();
      m = now.getMonth();
    }
    const fechaVencimiento = new Date(y, m, 10);
    let count = 0;

    for (const u of units) {
      const subtotal = new Prisma.Decimal(u.cuotaMantenimiento ?? 0);
      const itbis = subtotal.mul(0.18);
      const total = subtotal.add(itbis);

      // Usamos upsert o ignoramos errores si ya existe gracias al unique constraint [unitId, periodo]
      const current = await tx.invoice.findUnique({ where: { unitId_periodo: { unitId: u.id, periodo } } });
      if (!current) {
        await tx.invoice.create({
          data: {
            unitId: u.id,
            periodo,
            fechaVencimiento,
            subtotal,
            itbis,
            total,
            balance: total, // Inicializa el balance igual al total de la factura
            estado: InvoiceStatus.PENDING
          }
        });
        count++;
      }
    }
    return count;
  }

  private async generatePayroll(tx: any, condoId: string, periodo: string, yearStr: string, monthStr: string): Promise<number> {
    const empleados = await tx.employee.findMany({ where: { condoId, activo: true } });
    let y = Number(yearStr);
    let m = Number(monthStr) - 1; 
    if (isNaN(y) || isNaN(m)) {
      const now = new Date();
      y = now.getFullYear();
      m = now.getMonth();
    }
    const fechaLimitePago = new Date(y, m, 5);
    let count = 0;

    for (const e of empleados) {
      // Usamos el unique constraint: [condoId, referenciaId, periodo, tipo]
      const current = await tx.accountPayable.findUnique({ 
        where: { 
          condoId_referenciaId_periodo_tipo: { condoId, referenciaId: e.id, periodo, tipo: 'NOMINA' } 
        } 
      });
      
      if (!current) {
        await tx.accountPayable.create({
          data: {
            condoId,
            proveedor: `NÓMINA - ${e.nombre}`,
            monto: new Prisma.Decimal(e.salario ?? 0),
            fechaLimite: fechaLimitePago,
            estado: 'PENDIENTE',
            periodo,
            referenciaId: e.id,
            tipo: 'NOMINA'
          }
        });
        count++;
      }
    }
    return count;
  }

  async getAccountsPayable(condoId: string) {
    return this.prisma.accountPayable.findMany({ where: { condoId }, orderBy: { fechaLimite: 'asc' } });
  }

  async createAccountPayable(condoId: string, data: any) {
    return this.prisma.accountPayable.create({
      data: { condoId, proveedor: data.proveedor, monto: new Prisma.Decimal(data.monto || 0), fechaLimite: new Date(data.fechaLimite), estado: 'PENDIENTE' }
    });
  }

  async payAccountPayable(id: string) {
    return this.prisma.accountPayable.update({ where: { id }, data: { estado: 'PAGADO' } });
  }

  async markAsPaid(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new BadRequestException('Factura no encontrada');
    const nuevoEstado = invoice.estado === InvoiceStatus.PAID ? InvoiceStatus.PENDING : InvoiceStatus.PAID;
    return this.prisma.invoice.update({ where: { id: invoiceId }, data: { estado: nuevoEstado } });
  }
}
