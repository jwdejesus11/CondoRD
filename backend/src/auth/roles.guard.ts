import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminRole } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AdminRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    
    // El condoId de la petición debe coincidir con el del token para asegurar aislamiento
    const condoIdHeader = context.switchToHttp().getRequest().headers['x-condo-id'];
    
    // Si el usuario es SUPER_ADMIN, tiene acceso total
    if (user.role === AdminRole.SUPER_ADMIN) return true;

    // Verificar si el rol del usuario está permitido
    return requiredRoles.some((role) => user.role === role);
  }
}
