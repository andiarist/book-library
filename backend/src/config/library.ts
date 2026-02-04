import { config } from "dotenv";
config();

/**
 * Configuración de la biblioteca de libros
 */
export const libraryConfig = {
  /**
   * Ruta del directorio donde se encuentran los archivos de libros (EPUB, PDF, etc.)
   * Por defecto usa ./storage/library pero puede configurarse con LIBRARY_PATH
   */
  libraryPath: process.env.LIBRARY_PATH || "./storage/library",

  /**
   * Extensiones de archivo soportadas
   */
  supportedExtensions: [".epub", ".pdf", ".mobi", ".azw3"],
};
