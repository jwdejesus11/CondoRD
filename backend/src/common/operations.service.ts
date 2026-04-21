import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CaseStatus, VisitStatus, LostFoundStatus, AdminRole } from '@prisma/client';

@Injectable()
export class OperationsService {
  constructor(private prisma: PrismaService) {}

  // Gestión de Casos
  async createCase(condoId: string, data: any) {
    try {
      let unitId = data.unitId;
      
      const num = data.unidad || data.unit || data.unitNumber;
      if (num) {
        const unit = await this.prisma.unit.findFirst({
          where: { 
            condoId, 
            numero: { equals: String(num).trim(), mode: 'insensitive' } 
          }
        });
        
        if (!unit) {
          throw new BadRequestException(`La unidad "${num}" no existe en este condominio.`);
        }
        unitId = unit.id;
      }

      if (!unitId) {
        throw new BadRequestException('Es obligatorio asignar una unidad válida al caso.');
      }

      // Verificación final de integridad
      const finalUnit = await this.prisma.unit.findUnique({ where: { id: unitId } });
      if (!finalUnit || finalUnit.condoId !== condoId) {
        throw new BadRequestException('La unidad seleccionada no es válida para este condominio.');
      }

      return await this.prisma.case.create({
        data: {
          unitId: unitId,
          titulo: String(data.titulo || 'Sin título'),
          descripcion: String(data.descripcion || ''),
          prioridad: String(data.prioridad || 'MEDIA'),
          estado: CaseStatus.OPEN,
        },
        include: {
          unit: true
        }
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      console.error('[CRITICAL] Error creating case:', error);
      throw new BadRequestException('Error al procesar la creación del caso. Verifique los datos.');
    }
  }

  async updateCaseStatus(id: string, status: CaseStatus) {
    return this.prisma.case.update({
      where: { id },
      data: { estado: status },
    });
  }

  async addCaseComment(caseId: string, userId: string, comentario: string) {
    return this.prisma.caseComment.create({
      data: { caseId, userId, comentario },
    });
  }

  async getCases(condoId: string) {
    return this.prisma.case.findMany({
      where: { unit: { condoId } },
      include: { unit: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Control de Visitas Mejorado con Soporte para Visitante (Persona)
  async registerVisit(condoId: string, data: any) {
    let unitId = data.unitId;
    
    // Normalizar búsqueda de unidad
    const num = data.unidad || data.unit || data.numeroUnidad;
    if (num) {
        const unit = await this.prisma.unit.findFirst({
          where: { condoId, numero: String(num).trim() }
        });
        if (unit) unitId = unit.id;
    }

    if (!unitId) throw new BadRequestException('Unidad destino obligatoria');

    return this.prisma.visit.create({
      data: {
        unitId,
        nombreVisita: String(data.nombre || data.nombreVisita || 'Visitante'),
        cedulaVisita: data.cedula ? String(data.cedula) : null,
        motivo: String(data.motivo || 'Otros'),
        fechaEstimada: data.fecha ? new Date(data.fecha) : null,
        estado: VisitStatus.EXPECTED,
      },
      include: { unit: true }
    });
  }

  async getVisits(condoId: string) {
    return this.prisma.visit.findMany({
      where: { unit: { condoId } },
      include: { 
        unit: true,
        visitor: true
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async processCheckIn(visitId: string, visitorData: any) {
    let visitorId = null;

    // Si hay cédula, persistimos la Persona (Visitante)
    if (visitorData.cedula) {
      const visitor = await this.prisma.visitor.upsert({
        where: { cedula: String(visitorData.cedula) },
        update: {
          nombreCompleto: String(visitorData.nombreCompleto || visitorData.nombre),
          sexo: visitorData.sexo ? String(visitorData.sexo) : undefined,
          nacionalidad: visitorData.nacionalidad ? String(visitorData.nacionalidad) : undefined,
        },
        create: {
          cedula: String(visitorData.cedula),
          nombreCompleto: String(visitorData.nombreCompleto || visitorData.nombre),
          sexo: visitorData.sexo ? String(visitorData.sexo) : null,
          nacionalidad: visitorData.nacionalidad ? String(visitorData.nacionalidad) : null,
        }
      });
      visitorId = visitor.id;
    }

    return this.prisma.visit.update({
      where: { id: visitId },
      data: {
        visitorId: visitorId || undefined,
        nombreVisita: String(visitorData.nombreCompleto || visitorData.nombre),
        fechaIngreso: new Date(),
        estado: VisitStatus.CHECKED_IN,
      },
      include: { visitor: true, unit: true }
    });
  }

  async checkOutVisit(visitId: string) {
    return this.prisma.visit.update({
      where: { id: visitId },
      data: {
        fechaSalida: new Date(),
        estado: VisitStatus.CHECKED_OUT,
      },
    });
  }

  async getLostFound(condoId: string) {
    return this.prisma.lostFoundItem.findMany({ where: { condoId } });
  }

  async reportLostFound(condoId: string, data: any) {
    return this.prisma.lostFoundItem.create({
      data: {
        condoId: condoId,
        descripcion: String(data.descripcion || 'Sin descripción'),
        lugar: String(data.lugar || data.ubicacion || ''),
        fotosUrl: data.fotosUrl ? String(data.fotosUrl) : null,
        estado: LostFoundStatus.REPORTED,
        fecha: new Date(),
      },
    });
  }

  async markLostFoundAsClaimed(id: string) {
    console.log('[DEBUG] Marcando objeto como entregado, ID:', id);
    const item = await this.prisma.lostFoundItem.findUnique({ where: { id } });
    if (!item) {
      throw new Error('Objeto no encontrado');
    }
    return this.prisma.lostFoundItem.update({
      where: { id },
      data: { estado: LostFoundStatus.CLAIMED },
    });
  }

  async getAnnouncements(condoId: string) {
    return this.prisma.announcement.findMany({
      where: { condoId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAnnouncement(condoId: string, data: any) {
    return this.prisma.announcement.create({
      data: { 
        condoId: condoId, 
        titulo: String(data.titulo || 'Sin título'), 
        contenido: String(data.contenido || '') 
      },
    });
  }

  // Reservas
  async getCommonAreas(condoId: string) {
    return this.prisma.commonArea.findMany({ where: { condoId } });
  }

  async createCommonArea(condoId: string, data: any) {
    console.log('[OperationsService] Creating Common Area:', { condoId, data });
    return this.prisma.commonArea.create({
      data: {
        condoId: condoId,
        nombre: String(data.nombre || 'Área Común'),
        descripcion: String(data.descripcion || ''),
        capacidad: data.capacidad ? parseInt(String(data.capacidad), 10) : 0,
      }
    });
  }

  async getReservations(condoId: string) {
    return this.prisma.reservation.findMany({
      where: { area: { condoId } },
      include: { area: true },
      orderBy: { fecha: 'desc' },
    });
  }

  async createReservation(data: any) {
    return this.prisma.reservation.create({
      data: {
        commonAreaId: String(data.commonAreaId),
        userId: String(data.userId),
        fecha: new Date(data.fecha),
        horaInicio: String(data.horaInicio || ''),
        horaFin: String(data.horaFin || ''),
        estado: String(data.estado || 'PENDIENTE'),
      },
    });
  }

  // Documentos
  async getDocuments(condoId: string) {
    return this.prisma.document.findMany({ where: { condoId }, orderBy: { createdAt: 'desc' } });
  }

  async createDocument(condoId: string, data: any) {
    return this.prisma.document.create({
      data: {
        condoId: condoId,
        nombre: String(data.nombre || 'Documento'),
        categoria: String(data.categoria || 'General'),
        url: String(data.url || ''),
        roleMin: AdminRole.OWNER
      }
    });
  }
}
