import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch, BadRequestException } from '@nestjs/common';
import { FinancialService } from './financial.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

import { AdminRole } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';

@Controller('financial')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Roles(AdminRole.CONDO_ADMIN, AdminRole.OWNER)
  @Get('invoices/all')
  getAllInvoices(@Request() req: any) {
    return this.financialService.getAllInvoices(req.user.condoId);
  }

  // Rutas estáticas deben ir antes de las rutas dinámicas (:unitId)
  @Roles(AdminRole.CONDO_ADMIN)
  @Post('generate-period')
  generatePeriod(@Request() req: any, @Body() body: { periodo: string }) {
    if (!body.periodo) {
      throw new BadRequestException('El periodo es obligatorio (ej. 2026-04).');
    }
    return this.financialService.generatePeriod(req.user.condoId, body.periodo);
  }

  @Roles(AdminRole.CONDO_ADMIN)
  @Post('invoices/:unitId')
  createInvoice(@Param('unitId') unitId: string, @Body() data: any) {
    return this.financialService.createInvoice(unitId, data);
  }

  @Roles(AdminRole.CONDO_ADMIN, AdminRole.OWNER)
  @Post('payments/:invoiceId')
  registerPayment(@Param('invoiceId') invoiceId: string, @Body() data: any) {
    return this.financialService.registerPayment(invoiceId, data);
  }

  @Roles(AdminRole.CONDO_ADMIN)
  @Get('balance/all')
  getGlobalBalance(@Request() req: any) {
    return this.financialService.getGlobalBalance(req.user.condoId);
  }

  @Roles(AdminRole.CONDO_ADMIN, AdminRole.OWNER)
  @Get('balance/:unitId')
  getUnitBalance(@Param('unitId') unitId: string) {
    return this.financialService.getUnitBalance(unitId);
  }

  @Roles(AdminRole.CONDO_ADMIN)
  @Get('accounts-payable')
  getAP(@Request() req: any) {
    return this.financialService.getAccountsPayable(req.user.condoId);
  }

  @Post('accounts-payable')
  createAP(@Request() req: any, @Body() data: any) {
    return this.financialService.createAccountPayable(req.user.condoId, data);
  }

  @Patch('accounts-payable/:id/pay')
  payAP(@Param('id') id: string) {
    return this.financialService.payAccountPayable(id);
  }

  @Patch('invoices/:id/toggle-paid')
  togglePaid(@Param('id') id: string) {
    return this.financialService.markAsPaid(id);
  }
}
