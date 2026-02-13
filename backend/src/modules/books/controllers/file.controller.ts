import { Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { asyncHandler } from '../middlewares/async-handler';
import { parseBookId } from '../validators/books.validators';
import { validateFileAccess, safeFilename } from '../middlewares/file-security';
import {
  generateEtag,
  getContentType,
  parseRange,
  streamFile,
} from '../utils/file-stream';
import * as service from '../services/books.service';

/**
 * Sirve el archivo digital del libro (EPUB, PDF, etc.)
 * Soporta HTTP Range requests para streaming
 */
export const getBookFileController = asyncHandler(
  async (req: Request, res: Response) => {
    const bookId = parseBookId(req);
    const book = await service.getBookById(bookId);

    // Validar acceso al archivo
    validateFileAccess(book.filePath);

    const stat = fs.statSync(book.filePath!);
    const ext = path.extname(book.filePath!).toLowerCase();

    // Determinar si es una petición con extensión .epub
    const isEpubRoute = req.originalUrl.endsWith('/file.epub');
    const contentType = isEpubRoute
      ? 'application/epub+zip'
      : getContentType(ext);

    const filename = `${safeFilename(book.title)}${isEpubRoute ? '.epub' : ext}`;
    const etag = generateEtag(stat, book.filePath!);

    // Verificar ETag para 304 Not Modified
    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }

    // Parsear Range header si existe
    const rangeHeader = req.headers.range;
    let range = null;

    if (rangeHeader) {
      range = parseRange(rangeHeader, stat.size);

      // Rango inválido → 416 Range Not Satisfiable
      if (!range) {
        res.setHeader('Content-Range', `bytes */${stat.size}`);
        return res.status(416).end();
      }
    }

    // Stream del archivo
    streamFile(res, {
      filePath: book.filePath!,
      filename,
      contentType,
      range: range || undefined,
      etag,
      lastModified: stat.mtime,
    });
  },
);
