import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { InvoiceStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(private prisma: PrismaService) {}

  // Este método debería ser llamado por un Cron Job mensualmente
  async generateMonthlyInvoices() {
    const condos = await this.prisma.condo.findMany({
      include: { units: true }
    });

    const periodo = new Date().toISOString().slice(0, 7); // YYYY-MM

    for (const condo of condos) {
      for (const unit of condo.units) {
        // Evitar duplicados
        const exists = await this.prisma.invoice.findFirst({
          where: { unitId: unit.id, periodo }
        });

        if (!exists) {
          const subtotal = unit.cuotaMantenimiento;
          const itbis = new Decimal(subtotal).mul(0.18);
          const total = new Decimal(subtotal).add(itbis);

          const limitDate = new Date();
          limitDate.setDate(condo.diaCorte + 10); // 10 días de gracia por defecto

          await this.prisma.invoice.create({
            data: {
              unitId: unit.id,
              periodo,
              fechaVencimiento: limitDate,
              subtotal,
              itbis,
              total,
              estado: InvoiceStatus.PENDING,
            }
          });
        }
      }
    }
    this.logger.log(`Generadas facturas para el periodo ${periodo}`);
  }

  async calculateLateFees() {
    const today = new Date();
    const overdueInvoices = await this.prisma.invoice.findMany({
      where: {
        estado: { in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIAL] },
        fechaVencimiento: { lt: today }
      },
      include: { unit: { include: { condo: true } } }
    });

    for (const inv of overdueInvoices) {
      const condo = inv.unit.condo;
      if (Number(condo.tasaMora) > 0) {
        const moraAmount = new Decimal(inv.subtotal).mul(condo.tasaMora).div(100);
        await this.prisma.invoice.update({
          where: { id: inv.id },
          data: {
            mora: { increment: moraAmount },
            total: { increment: moraAmount },
            estado: InvoiceStatus.OVERDUE
          }
        });
      }
    }
  }
}
