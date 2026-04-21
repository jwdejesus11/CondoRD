import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

// Límites financieros para República Dominicana (DOP)
const MAX_INTEGER_DIGITS = 12; // Billones (suficiente para condominios)
const DECIMAL_PLACES = 2; // Estándar Contable
const MAX_MAINTENANCE_FEE = 1000000; // 1 Millón DOP (Regla de negocio razonable)

/**
 * Validador contable estricto.
 * Rechaza desbordamientos, formatos extraños y precisiones excesivas.
 */
export function isStrictNumber(value: any): boolean {
  if (value === null || value === undefined) return false;
  
  const trimmed = String(value).trim();
  
  // Regex: Solo permite números con hasta 2 decimales opcionales
  if (!/^-?[0-9]+(\.[0-9]{1,2})?$/.test(trimmed)) return false;

  const parts = trimmed.split('.');
  if (parts[0].replace('-', '').length > MAX_INTEGER_DIGITS) return false;
  
  return true;
}

/**
 * Convierte entrada a Prisma.Decimal con rigor contable.
 * - Redondea a 2 decimales (toDecimalPlaces(2))
 * - Valida rangos de negocio
 */
export function toDecimal(
  value: any, 
  fieldName: string, 
  options: { required?: boolean; max?: number } = {}
): Prisma.Decimal | null {
  const { required = false, max = MAX_MAINTENANCE_FEE } = options;

  // 1. Manejo de vacíos
  if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
    if (required) throw new BadRequestException(`El campo '${fieldName}' es obligatorio.`);
    return null;
  }

  // 2. Validación técnica estricta (Regex + Longitud)
  if (!isStrictNumber(value)) {
    throw new BadRequestException(
      `${fieldName}: Formato inválido. Use hasta 2 decimales (ej: 1000.50) y evite números excesivamente largos.`
    );
  }

  try {
    const decimal = new Prisma.Decimal(value).toDecimalPlaces(DECIMAL_PLACES);

    // 3. Validación de Regla de Negocio (Business Constraints)
    if (decimal.greaterThan(max)) {
      throw new BadRequestException(`${fieldName}: El valor excede el límite permitido de ${max}.`);
    }
    
    if (decimal.lessThan(0) && fieldName !== 'balance') {
       throw new BadRequestException(`${fieldName}: No se permiten valores negativos.`);
    }

    return decimal;
  } catch (error) {
    if (error instanceof BadRequestException) throw error;
    throw new BadRequestException(`${fieldName}: Error de validación financiera.`);
  }
}

/**
 * Normaliza campos enteros (Pisos, Cantidades)
 */
export function toInt(value: any, fieldName: string, required = false): number | null {
  if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
    if (required) throw new BadRequestException(`El campo '${fieldName}' es obligatorio.`);
    return null;
  }

  const num = Number(value);
  if (!Number.isInteger(num) || isNaN(num) || !isFinite(num)) {
    throw new BadRequestException(`${fieldName}: Debe ser un número entero válido.`);
  }

  if (num < 0 || num > 200) { // Límite razonable para pisos/unidades
    throw new BadRequestException(`${fieldName}: Valor fuera de rango lógico (0-200).`);
  }
  
  return num;
}
