import * as fs from 'fs';
import * as crypto from 'crypto';
import { Response } from 'express';

/**
 * Genera un ETag para un archivo basado en su path, tamaño y fecha de modificación
 */
export const generateEtag = (stat: fs.Stats, filePath: string): string => {
  const base = `${filePath}:${stat.size}:${stat.mtimeMs}`;
  return crypto.createHash('sha1').update(base).digest('hex');
};

/**
 * Obtiene el Content-Type apropiado según la extensión del archivo
 */
export const getContentType = (ext: string): string => {
  switch (ext.toLowerCase()) {
    case '.epub':
      return 'application/epub+zip';
    case '.pdf':
      return 'application/pdf';
    case '.mobi':
      return 'application/x-mobipocket-ebook';
    case '.azw3':
      return 'application/vnd.amazon.ebook';
    default:
      return 'application/octet-stream';
  }
};

interface RangeParseResult {
  start: number;
  end: number;
  chunkSize: number;
}

/**
 * Parsea el header Range de una petición HTTP
 */
export const parseRange = (
  rangeHeader: string,
  fileSize: number,
): RangeParseResult | null => {
  const match = /^bytes=(\d+)-(\d*)$/.exec(rangeHeader);

  if (!match) {
    return null;
  }

  const start = Number(match[1]);
  const end = match[2] ? Number(match[2]) : fileSize - 1;

  // Validar rango
  if (
    Number.isNaN(start) ||
    Number.isNaN(end) ||
    start < 0 ||
    end < 0 ||
    start > end ||
    end >= fileSize
  ) {
    return null;
  }

  return {
    start,
    end,
    chunkSize: end - start + 1,
  };
};

interface StreamFileOptions {
  filePath: string;
  filename: string;
  contentType: string;
  range?: RangeParseResult;
  etag: string;
  lastModified: Date;
}

/**
 * Stream de un archivo al cliente con soporte para rangos (HTTP 206)
 */
export const streamFile = (res: Response, options: StreamFileOptions): void => {
  const { filePath, filename, contentType, range, etag, lastModified } =
    options;
  const fileSize = fs.statSync(filePath).size;

  // Headers comunes
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('ETag', etag);
  res.setHeader('Last-Modified', lastModified.toUTCString());
  res.setHeader('Cache-Control', 'private, max-age=3600');

  // Sin rango → stream completo
  if (!range) {
    res.setHeader('Content-Length', fileSize);
    return void fs.createReadStream(filePath).pipe(res);
  }

  // Con rango → partial content (206)
  res.status(206);
  res.setHeader(
    'Content-Range',
    `bytes ${range.start}-${range.end}/${fileSize}`,
  );
  res.setHeader('Content-Length', range.chunkSize);

  fs.createReadStream(filePath, {
    start: range.start,
    end: range.end,
  }).pipe(res);
};
