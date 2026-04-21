import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { InvoiceStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getFinancialSummary(condoId: string, startDate: Date, endDate: Date) {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        unit: { condoId },
        createdAt: { gte: startDate, lte: endDate },
      },
    });

    const income = await this.prisma.payment.aggregate({
      where: {
        invoice: { unit: { condoId } },
        status: PaymentStatus.APPROVED,
        fechaPago: { gte: startDate, lte: endDate },
      },
      _sum: { monto: true },
    });

    const expenses = await this.prisma.expense.aggregate({
      where: {
        condoId,
        fecha: { gte: startDate, lte: endDate },
      },
      _sum: { monto: true },
    });

    const totalInvoiced = invoices.reduce((acc, inv) => acc + Number(inv.total), 0);
    const totalCollected = Number(income._sum.monto || 0);
    const totalExpenses = Number(expenses._sum.monto || 0);

    return {
      totalInvoiced,
      totalCollected,
      totalExpenses,
      balance: totalCollected - totalExpenses,
    };
  }

  async getDebtReport(condoId: string) {
    const units = await this.prisma.unit.findMany({
      where: { condoId },
      include: {
        invoices: {
          where: { estado: { in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIAL, InvoiceStatus.OVERDUE] } },
        },
      },
    });

    return units.map(u => ({
      unidad: u.numero,
      deudaTotal: u.invoices.reduce((acc, inv) => acc + Number(inv.total), 0),
    })).filter(u => u.deudaTotal > 0);
  }
}
