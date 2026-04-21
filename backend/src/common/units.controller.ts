import { 
  Controller, Get, Post, Patch, Delete, Body, Param, 
  UseGuards, Request, UnauthorizedException,
  HttpStatus
} from '@nestjs/common';
import { UnitsService } from './units.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CreateUnitDto, UpdateUnitDto } from './dto/unit.dto';

/**
 * UnitsController: Gestiona el inventario de propiedades físiscas.
 * Lógica de negocio encapsulada en UnitsService.
 * Errores inesperados capturados por AllExceptionsFilter.
 */
@Controller('units')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  private getCondoId(req: any): string {
    const condoId = req.user?.condoId;
    if (!condoId) throw new UnauthorizedException('Condo ID faltante en sesión.');
    return condoId;
  }

  @Get()
  async findAll(@Request() req: any) {
    return this.unitsService.findAll(this.getCondoId(req));
  }

  @Post()
  async create(@Request() req: any, @Body() data: CreateUnitDto) {
    return this.unitsService.createUnit(
      this.getCondoId(req), 
      data, 
      { userId: req.user.sub, requestId: req.id }
    );
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: UpdateUnitDto) {
    return this.unitsService.updateUnit(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.unitsService.deleteUnit(id);
  }

  @Get('residents')
  async getResidents(@Request() req: any) {
    return this.unitsService.getResidents(this.getCondoId(req));
  }

  @Post('residents/link')
  async linkResident(@Request() req: any, @Body() data: any) {
    return this.unitsService.linkResident(this.getCondoId(req), data);
  }
}
