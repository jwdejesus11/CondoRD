import { Injectable, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUnitDto, UpdateUnitDto } from './dto/unit.dto';
import { toDecimal, toInt } from '../utils/normalization.util';
import { Prisma } from '@prisma/client';

@Injectable()
export class UnitsService {
  private readonly logger = new Logger(UnitsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Capa de Aplicación: Normaliza y valida la intención de negocio.
   * Garantiza que los campos obligatorios para creación estén presentes y saneados.
   */
  normalizeInput(data: any, isUpdate = false) {
    const numero = data.numero ? String(data.numero).trim() : (isUpdate ? undefined : '');
    
    // Validación de negocio para el número (no permitimos vacíos ni espacios)
    if (!isUpdate && (!numero || numero === '')) {
      throw new BadRequestException('El número de unidad es un campo obligatorio y no puede estar vacío.');
    }

    return {
      numero,
      tipo: data.tipo,
      status: data.status,
      area: data.area ? String(data.area).trim() : (isUpdate ? undefined : ''),
      piso: toInt(data.piso, 'piso'),
      cuotaMantenimiento: toDecimal(data.cuotaMantenimiento, 'cuotaMantenimiento', { required: !isUpdate }),
      metrosCuadrados: toDecimal(data.metrosCuadrados, 'metrosCuadrados', { max: 10000 }),
    };
  }

  async createUnit(condoId: string, data: CreateUnitDto, context: { userId: string; requestId: string }) {
    const clean = this.normalizeInput(data);

    // Garantía de integridad estructural: no puede haber numero vacío en CREATE
    if (!clean.numero || clean.numero === '') {
       throw new BadRequestException('Fallo de validación: El número de unidad no fue procesado correctamente.');
    }

    // 1. Verificación de existencia
    const existing = await this.prisma.unit.findFirst({
      where: { condoId, numero: clean.numero }
    });

    if (existing) {
      throw new ConflictException(`La unidad ${clean.numero} ya existe en este condominio.`);
    }

    // 2. Transacción Atómica
    return await this.prisma.$transaction(async (tx) => {
      const unit = await tx.unit.create({
        data: {
          condoId,
          numero: clean.numero as string, // Cast seguro tras validación explícita anterior
          tipo: clean.tipo || 'APARTAMENTO',
          cuotaMantenimiento: clean.cuotaMantenimiento!,
          metrosCuadrados: clean.metrosCuadrados,
          status: clean.status || 'DISPONIBLE',
          piso: clean.piso,
          area: clean.area,
        }
      });

      // Factura inicial
      const now = new Date();
      const periodo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      await tx.invoice.create({
        data: {
          unitId: unit.id,
          periodo,
          fechaVencimiento: new Date(now.getFullYear(), now.getMonth() + 1, 10),
          subtotal: clean.cuotaMantenimiento!,
          itbis: new Prisma.Decimal(0),
          total: clean.cuotaMantenimiento!,
          estado: 'PENDING'
        }
      });

      return unit;
    });
  }

  async updateUnit(id: string, data: UpdateUnitDto) {
    const clean = this.normalizeInput(data, true);

    // Si viene numero en el update, no puede estar vacío (si se incluyó en el body)
    if (clean.numero !== undefined && clean.numero === '') {
        throw new BadRequestException('El número de unidad no puede ser un texto vacío.');
    }
    
    return this.prisma.unit.update({
      where: { id },
      data: {
        ...clean,
        cuotaMantenimiento: clean.cuotaMantenimiento ?? undefined,
        metrosCuadrados: clean.metrosCuadrados ?? undefined,
        piso: clean.piso ?? undefined
      }
    });
  }

  async deleteUnit(id: string) {
    return this.prisma.unit.delete({ where: { id } });
  }

  async findAll(condoId: string) {
    return this.prisma.unit.findMany({
      where: { condoId },
      include: { residents: { include: { user: true } } },
      orderBy: { numero: 'asc' }
    });
  }

  async getResidents(condoId: string) {
    return this.prisma.residentProfile.findMany({
      where: { unit: { condoId } },
      include: { 
        user: true,
        unit: true 
      },
      orderBy: { user: { nombre: 'asc' } }
    });
  }

  async linkResident(condoId: string, data: { nombre: string; email: string; unitId: string }) {
    const unit = await this.prisma.unit.findUnique({ where: { id: data.unitId } });
    if (!unit || unit.condoId !== condoId) throw new BadRequestException('Unidad no válida');

    // Buscar o crear usuario
    let user = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: data.email,
          nombre: data.nombre,
          password: 'change-me-123', // En producción se enviaría invitación
        }
      });
    }

    // Asegurar relación con el condominio y rol OWNER
    await this.prisma.userCondo.upsert({
      where: { userId_condoId: { userId: user.id, condoId } },
      update: { role: 'OWNER' },
      create: { 
        userId: user.id, 
        condoId, 
        role: 'OWNER' 
      }
    });

    // Crear perfil
    return this.prisma.residentProfile.create({
      data: {
        userId: user.id,
        unitId: unit.id,
        esDueno: true
      },
      include: { user: true, unit: true }
    });
  }
}
