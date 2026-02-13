import { Request, Response } from 'express';
import { libraryConfig } from '../../../config/library';
import { asyncHandler } from '../middlewares/async-handler';
import { scanLibraryFolder } from '../services';

/**
 * Escanea la biblioteca local y añade libros encontrados
 */
export const scanLibraryController = asyncHandler(
  async (_req: Request, res: Response) => {
    if (!libraryConfig.libraryPath) {
      return res.status(400).json({
        message:
          'No se ha configurado LIBRARY_PATH en las variables de entorno',
      });
    }

    const results = await scanLibraryFolder();

    res.json({
      message: 'Escaneo completado',
      libraryPath: libraryConfig.libraryPath,
      ...results,
    });
  },
);
