import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'condord_super_secret_key_12345',
    });
  }

  async validate(payload: any) {
    // Verificamos si el condominio aún existe (por si se reinició la DB)
    const condoExists = await this.prisma.condo.count({ where: { id: payload.condoId } });
    
    let activeCondoId = payload.condoId;
    
    if (condoExists === 0) {
      // Si el condo del token ya no existe, buscamos el primero asociado al usuario
      const userCondo = await this.prisma.userCondo.findFirst({
        where: { userId: payload.sub },
        select: { condoId: true }
      });
      if (userCondo) {
        activeCondoId = userCondo.condoId;
      }
    }

    return { 
      userId: payload.sub, 
      sub: payload.sub,
      email: payload.email, 
      role: payload.role, 
      condoId: activeCondoId 
    };
  }
}
