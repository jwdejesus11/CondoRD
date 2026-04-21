import { BadRequestException } from '@nestjs/common';
import * as path from 'path';

/**
 * Sanitiza y valida rutas para evitar Directory Traversal y caracteres ilegales.
 */
export function safePath(base: string, subPath: string): string {
  if (!subPath || typeof subPath !== 'string') {
    throw new BadRequestException('Path inválido: El subPath es requerido y debe ser un string.');
  }

  // Bloquear caracteres ilegales en Windows/Unix y secuencias de escape
  const illegalChars = /[<>:"|?*]/;
  if (illegalChars.test(subPath)) {
    throw new BadRequestException('Path inválido: Contiene caracteres prohibidos.');
  }

  // Normalizar y resolver para evitar .. (Directory Traversal)
  const normalizedPath = path.normalize(subPath).replace(/^(\.\.(\/|\\|$))+/, '');
  
  if (normalizedPath.startsWith('/') || normalizedPath.startsWith('\\')) {
    throw new BadRequestException('Path inválido: No se permiten rutas absolutas.');
  }

  const finalPath = path.join(base, normalizedPath);

  // Verificación final de que permanece dentro del base
  if (!finalPath.startsWith(path.resolve(base))) {
    throw new BadRequestException('Path inválido: Intento de acceso fuera del directorio permitido.');
  }

  return finalPath;
}

/**
 * Sanitiza un nombre de archivo para que sea seguro en el sistema de archivos.
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return 'unnamed_file';
  return filename
    .replace(/[<>:"/\\|?*]/g, '_') // Quitar caracteres ilegales
    .replace(/\s+/g, '_')          // Quitar espacios
    .replace(/_{2,}/g, '_');       // Colapsar guiones bajos
}
