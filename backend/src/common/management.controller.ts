import { Controller, Get, Post, Body, Param, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { ManagementService } from './management.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

/**
 * ManagementController: Supervisión administrativa, personal y nómina.
 * Lógica delegada a ManagementService.
 * Observabilidad garantizada por AllExceptionsFilter.
 */
import { AdminRole } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';

@Controller('management')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ManagementController {
  constructor(private readonly managementService: ManagementService) {}

  private getCondoId(req: any): string {
    const condoId = req.user?.condoId;
    if (!condoId) throw new UnauthorizedException('Entorno de condominio no detectado.');
    return condoId;
  }

  @Roles(AdminRole.CONDO_ADMIN)
  @Get('employees')
  getEmployees(@Request() req: any) {
    return this.managementService.getEmployees(this.getCondoId(req));
  }

  @Roles(AdminRole.CONDO_ADMIN)
  @Post('employees')
  createEmployee(@Request() req: any, @Body() data: any) {
    return this.managementService.createEmployee(this.getCondoId(req), data);
  }

  @Roles(AdminRole.CONDO_ADMIN)
  @Get('payroll')
  getPayroll(@Request() req: any) {
    return this.managementService.getPayrollReport(this.getCondoId(req));
  }

  @Get('condo')
  getCondo(@Request() req: any) {
    return this.managementService.getCondo(this.getCondoId(req));
  }

  @Roles(AdminRole.CONDO_ADMIN)
  @Post('condo')
  updateCondo(@Request() req: any, @Body() data: any) {
    return this.managementService.updateCondo(this.getCondoId(req), data);
  }

  @Roles(AdminRole.CONDO_ADMIN)
  @Get('users')
  getUsers(@Request() req: any) {
    return this.managementService.getUsers(this.getCondoId(req));
  }

  @Post('users')
  upsertUser(@Request() req: any, @Body() data: any) {
    return this.managementService.upsertUser(this.getCondoId(req), data);
  }

  @Get('dashboard')
  getDashboard(@Request() req: any) {
    return this.managementService.getDashboardInfo(this.getCondoId(req));
  }
}
