import { 
  Controller, Get, Post, Body, Param, UseGuards, Request, 
  UnauthorizedException, Delete, Patch
} from '@nestjs/common';
import { OperationsService } from './operations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

import { AdminRole } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';

/**
 * OperationsController: Controlador limpio y semántico.
 * El manejo de errores inesperados y el logging de fallos se delega
 * al AllExceptionsFilter global para garantizar consistencia y observabilidad.
 */
@Controller('operations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  private getCondoId(req: any): string {
    const condoId = req.user?.condoId;
    if (!condoId) throw new UnauthorizedException('Su sesión no está vinculada a un condominio válido.');
    return condoId;
  }

  @Get('common-areas')
  getCommonAreas(@Request() req: any) {
    return this.operationsService.getCommonAreas(this.getCondoId(req));
  }

  @Roles(AdminRole.CONDO_ADMIN)
  @Post('common-areas')
  createCommonArea(@Request() req: any, @Body() data: any) {
    return this.operationsService.createCommonArea(this.getCondoId(req), data);
  }

  @Get('announcements')
  getAnnouncements(@Request() req: any) {
    return this.operationsService.getAnnouncements(this.getCondoId(req));
  }

  @Roles(AdminRole.CONDO_ADMIN)
  @Post('announcements')
  createAnnouncement(@Request() req: any, @Body() data: any) {
    return this.operationsService.createAnnouncement(this.getCondoId(req), data);
  }

  @Get('reservations')
  getReservations(@Request() req: any) {
    return this.operationsService.getReservations(this.getCondoId(req));
  }

  @Roles(AdminRole.OWNER, AdminRole.TENANT, AdminRole.CONDO_ADMIN)
  @Post('reservations')
  createReservation(@Request() req: any, @Body() data: any) {
    return this.operationsService.createReservation({
        ...data,
        userId: req.user.sub
    });
  }

  @Get('documents')
  getDocuments(@Request() req: any) {
    return this.operationsService.getDocuments(this.getCondoId(req));
  }

  @Roles(AdminRole.CONDO_ADMIN)
  @Post('documents')
  createDocument(@Request() req: any, @Body() data: any) {
    return this.operationsService.createDocument(this.getCondoId(req), data);
  }

  @Get('lost-found')
  getLostFound(@Request() req: any) {
    return this.operationsService.getLostFound(this.getCondoId(req));
  }

  @Post('lost-found')
  reportLostFound(@Request() req: any, @Body() data: any) {
    return this.operationsService.reportLostFound(this.getCondoId(req), data);
  }

  @Patch('lost-found/:id/claim')
  markLostFoundAsClaimed(@Param('id') id: string) {
    return this.operationsService.markLostFoundAsClaimed(id);
  }

  @Get('cases')
  getCases(@Request() req: any) {
    return this.operationsService.getCases(this.getCondoId(req));
  }

  @Roles(AdminRole.OWNER, AdminRole.TENANT, AdminRole.CONDO_ADMIN)
  @Post('cases')
  createCase(@Request() req: any, @Body() data: any) {
    return this.operationsService.createCase(this.getCondoId(req), data);
  }

  @Patch('cases/:id/status')
  updateCaseStatus(@Param('id') id: string, @Body() body: { status: any }) {
    return this.operationsService.updateCaseStatus(id, body.status);
  }

  @Roles(AdminRole.CONDO_ADMIN, AdminRole.SECURITY)
  @Get('visits')
  getVisits(@Request() req: any) {
    return this.operationsService.getVisits(this.getCondoId(req));
  }

  @Roles(AdminRole.OWNER, AdminRole.TENANT, AdminRole.CONDO_ADMIN)
  @Post('visits')
  registerVisit(@Request() req: any, @Body() data: any) {
    return this.operationsService.registerVisit(this.getCondoId(req), data);
  }

  @Roles(AdminRole.SECURITY, AdminRole.CONDO_ADMIN)
  @Patch('visits/:id/check-in')
  checkInVisit(@Param('id') id: string, @Body() visitorData: any) {
    return this.operationsService.processCheckIn(id, visitorData);
  }

  @Roles(AdminRole.SECURITY, AdminRole.CONDO_ADMIN)
  @Patch('visits/:id/check-out')
  checkOutVisit(@Param('id') id: string) {
    return this.operationsService.checkOutVisit(id);
  }
}
