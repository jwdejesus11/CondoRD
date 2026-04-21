import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export enum UnitType {
  APARTAMENTO = 'APARTAMENTO',
  PARQUEO = 'PARQUEO',
  LOCAL = 'LOCAL',
  PENTHOUSE = 'PENTHOUSE',
  TRASTERO = 'TRASTERO'
}

export enum UnitStatus {
  DISPONIBLE = 'DISPONIBLE',
  OCUPADO = 'OCUPADO',
  MANTENIMIENTO = 'MANTENIMIENTO',
  BLOQUEADO = 'BLOQUEADO'
}

export class CreateUnitDto {
  @IsString()
  @IsNotEmpty()
  numero: string;

  @IsEnum(UnitType)
  @IsOptional()
  tipo?: UnitType;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  cuotaMantenimiento: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  metrosCuadrados: number;

  @IsEnum(UnitStatus)
  @IsOptional()
  status?: UnitStatus;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  piso?: number;

  @IsString()
  @IsOptional()
  area?: string;
}

export class UpdateUnitDto extends PartialType(CreateUnitDto) {}
