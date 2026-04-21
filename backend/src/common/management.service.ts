import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { InvoiceStatus } from '@prisma/client';

@Injectable()
export class ManagementService {
  constructor(private prisma: PrismaService) {}

  // Branding y Configuración
  async updateCondoBranding(condoId: string, data: any) {
    return this.prisma.condo.update({
      where: { id: condoId },
      data: {
        logoUrl: data.logoUrl,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        nombre: data.nombre,
        rnc: data.rnc,
        direccion: data.direccion,
      },
    });
  }

  // Empleados
  async createEmployee(condoId: string, data: any) {
    return this.prisma.employee.create({
      data: {
        condoId,
        nombre: data.nombre,
        cargo: data.cargo,
        salario: new Decimal(data.salario),
      },
    });
  }

  async getEmployees(condoId: string) {
    return this.prisma.employee.findMany({ where: { condoId } });
  }

  // Nómina
  async generatePayroll(periodo: string, employeeIds: string[]) {
    const payroll = await this.prisma.payroll.create({
      data: { periodo, fechaPago: new Date() },
    });

    for (const empId of employeeIds) {
      const emp = await this.prisma.employee.findUnique({ where: { id: empId } });
      if (emp) {
        const montoBruto = emp.salario;
        const deducciones = new Decimal(montoBruto).mul(0.1); // Ejemplo 10% deducciones
        const montoNeto = new Decimal(montoBruto).sub(deducciones);

        await this.prisma.payrollItem.create({
          data: {
            payrollId: payroll.id,
            employeeId: empId,
            montoBruto,
            deducciones,
            montoNeto,
          },
        });
      }
    }
    return payroll;
  }

  async getPayrollReport(condoId: string) {
    return this.prisma.payroll.findMany({
      where: { items: { some: { employee: { condoId } } } },
      include: { items: { include: { employee: true } } }
    });
  }

  async getCondo(condoId: string) {
    return this.prisma.condo.findUnique({ where: { id: condoId } });
  }

  async updateCondo(condoId: string, data: any) {
    return this.prisma.condo.update({
      where: { id: condoId },
      data: {
        nombre: data.nombre,
        direccion: data.direccion,
        logoUrl: data.logoUrl,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        tasaMora: data.tasaMora,
      }
    });
  }

  // Reservas
  async createReservation(condoId: string, userId: string, data: any) {
    // Validar conflictos con lógica estricta de solapamiento
    const targetDate = new Date(data.fecha);
    targetDate.setUTCHours(0, 0, 0, 0); // Normalizar a medianoche UTC para comparación consistente

    const conflict = await this.prisma.reservation.findFirst({
      where: {
        commonAreaId: data.commonAreaId,
        fecha: targetDate, // Comparar fecha exacta normalizada
        AND: [
          { horaInicio: { lt: data.horaFin } },
          { horaFin: { gt: data.horaInicio } }
        ]
      },
    });

    if (conflict) throw new BadRequestException('El horario ya está reservado');

    return this.prisma.reservation.create({
      data: {
        commonAreaId: data.commonAreaId,
        userId,
        fecha: targetDate,
        horaInicio: data.horaInicio,
        horaFin: data.horaFin,
      },
    });
  }

  // Usuarios y Roles
  async getUsers(condoId: string) {
    return this.prisma.userCondo.findMany({
      where: { condoId },
      include: { user: { select: { id: true, email: true, nombre: true } } }
    });
  }

  async upsertUser(condoId: string, data: any) {
    const bcrypt = require('bcryptjs');
    let user;

    if (data.userId) {
      user = await this.prisma.user.findUnique({ where: { id: data.userId } });
    } else {
      user = await this.prisma.user.findUnique({ where: { email: data.email } });
    }

    const updateData: any = {};
    if (data.nombre) updateData.nombre = data.nombre;
    if (data.password) updateData.password = await bcrypt.hash(data.password, 10);

    if (!user) {
      const hashedPassword = await bcrypt.hash(data.password || 'admin123', 10);
      user = await this.prisma.user.create({
        data: {
          email: data.email,
          nombre: data.nombre,
          password: hashedPassword
        }
      });
    } else {
      if (Object.keys(updateData).length > 0) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: updateData
        });
      }
    }

    return this.prisma.userCondo.upsert({
      where: { userId_condoId: { userId: user.id, condoId } },
      update: { role: data.role },
      create: { 
        userId: user.id, 
        condoId, 
        role: data.role 
      }
    });
  }

  async getDashboardInfo(condoId: string) {
    const [units, invoices, cases, visits] = await Promise.all([
      this.prisma.unit.findMany({ where: { condoId }, include: { residents: true } }),
      this.prisma.invoice.findMany({ 
        where: { unit: { condoId } }, 
        include: { unit: true },
        orderBy: { createdAt: 'desc' },
        take: 5 
      }),
      this.prisma.case.findMany({ 
        where: { unit: { condoId } }, 
        orderBy: { createdAt: 'desc' },
        take: 5 
      }),
      this.prisma.visit.findMany({ 
        where: { unit: { condoId } }, 
        orderBy: { createdAt: 'desc' },
        take: 5 
      }),
    ]);

    const totalUnits = units.length;
    // Considera la unidad ocupada si tiene el estado explícito OCUPADO o si tiene residentes registrados
    const occupied = units.filter(u => u.status === 'OCUPADO' || u.residents.length > 0).length;
    
    // Calcular balance total pendiente
    const allInvoices = await this.prisma.invoice.findMany({
      where: { unit: { condoId }, estado: { not: 'CANCELLED' } },
      include: { payments: { where: { status: 'APPROVED' } } }
    });

    let totalBalance = new Decimal(0);
    let pendingCount = 0;
    allInvoices.forEach(inv => {
      if (inv.estado === InvoiceStatus.PENDING || inv.estado === InvoiceStatus.PARTIAL) {
        const currentBalance = (inv.balance.eq(0) && inv.estado === InvoiceStatus.PENDING) ? inv.total : inv.balance;
        
        if (currentBalance.gt(0)) {
          totalBalance = totalBalance.add(currentBalance);
          pendingCount++;
        }
      }
    });

    // Actividad reciente combinada
    const activity = [
      ...invoices.map(i => ({ id: i.id, type: 'INVOICE', title: `Factura Generada - Unidad ${i.unit.numero}`, date: i.createdAt, amount: i.total })),
      ...cases.map(c => ({ id: c.id, type: 'CASE', title: `Nuevo Caso: ${c.titulo}`, date: c.createdAt, status: c.estado })),
      ...visits.map(v => ({ id: v.id, type: 'VISIT', title: `Visita Registrada: ${v.nombreVisita}`, date: v.createdAt, status: v.estado })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);

    return {
      stats: {
        totalUnits,
        occupied,
        totalBalance,
        pendingCount
      },
      recentActivity: activity
    };
  }
}
