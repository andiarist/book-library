import * as fs from "fs";
import * as path from "path";
import { libraryConfig } from "../config/library";

export interface ScannedFile {
  absolutePath: string;
  relativePath: string;
  filename: string;
  extension: string;
}

/**
 * Escanea recursivamente un directorio buscando archivos con extensiones soportadas
 */
export const scanDirectory = (
  dirPath: string,
  baseDir: string = dirPath,
): ScannedFile[] => {
  const results: ScannedFile[] = [];

  try {
    // Verificar que el directorio existe
    if (!fs.existsSync(dirPath)) {
      console.warn(`El directorio no existe: ${dirPath}`);
      return results;
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Recursivamente escanear subdirectorios
        results.push(...scanDirectory(fullPath, baseDir));
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();

        // Verificar si la extensión está soportada
        if (libraryConfig.supportedExtensions.includes(ext)) {
          results.push({
            absolutePath: path.resolve(fullPath),
            relativePath: path.relative(baseDir, fullPath),
            filename: entry.name,
            extension: ext,
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error al escanear directorio ${dirPath}:`, error);
  }

  return results;
};

/**
 * Escanea el directorio de biblioteca configurado
 */
export const scanLibraryDirectory = (): ScannedFile[] => {
  const libraryPath = path.resolve(libraryConfig.libraryPath);
  console.log(`Escaneando biblioteca en: ${libraryPath}`);
  return scanDirectory(libraryPath);
};
