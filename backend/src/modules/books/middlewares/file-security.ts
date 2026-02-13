import * as path from 'path';
import * as fs from 'fs';

export class FileSecurityError extends Error {
  constructor(
    message: string,
    public status: number = 403,
  ) {
    super(message);
    this.name = 'FileSecurityError';
  }
}

const LIBRARY_ROOT = path.resolve(
  process.env.LIBRARY_PATH ?? path.join(process.cwd(), 'storage', 'library'),
);

/**
 * Verifica que un archivo esté dentro del directorio de biblioteca permitido
 * Previene directory traversal attacks
 */
export const isInsideLibrary = (filePath: string): boolean => {
  const resolved = path.resolve(filePath);
  const root = LIBRARY_ROOT.endsWith(path.sep)
    ? LIBRARY_ROOT
    : LIBRARY_ROOT + path.sep;

  return resolved.startsWith(root);
};

/**
 * Valida que un archivo sea accesible de forma segura
 */
export const validateFileAccess = (filePath: string | null): void => {
  if (!filePath) {
    throw new FileSecurityError(
      'Este libro no tiene archivo digital asociado',
      404,
    );
  }

  if (!isInsideLibrary(filePath)) {
    throw new FileSecurityError('Ruta de archivo no permitida');
  }

  if (!fs.existsSync(filePath)) {
    throw new FileSecurityError(
      'Archivo no encontrado en el sistema de archivos',
      404,
    );
  }
};

/**
 * Sanitiza un nombre de archivo para evitar problemas
 */
export const safeFilename = (name: string): string => {
  return name.replace(/[^\w\s.-]/g, '').trim() || 'book';
};

export { LIBRARY_ROOT };
