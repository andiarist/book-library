import { Request, Response, NextFunction } from "express";
import * as fs from "fs";
import * as path from "path";
import * as service from "./books.service";
import { libraryConfig } from "../../config/library";
import crypto from "crypto";

type AppError = {
  status?: number;
  message?: string;
};

const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res, next).catch(next);

const errorResponse = (res: Response, error: unknown) => {
  const err = error as AppError;
  const status = err?.status ?? 500;
  const message = err?.message ?? "Unexpected error";
  return res.status(status).json({ message });
};

const parseIdParam = (req: Request): number => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    // usamos el mismo shape que el service
    throw { status: 400, message: "Invalid book ID" };
  }
  return id;
};

export const searchBookByIsbnController = asyncHandler(async (req, res) => {
  try {
    const book = await service.searchBookByIsbn(req.params.isbn as string);
    res.json(book);
  } catch (e) {
    errorResponse(res, e);
  }
});

export const searchBooksByTextController = asyncHandler(async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      res.status(400).json({ message: 'Query parameter "q" is required' });
      return;
    }

    const results = await service.searchBookByText(query);
    res.json(results);
  } catch (e) {
    errorResponse(res, e);
  }
});

export const getAllBooksController = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const result = await service.getAllBooks(page, limit);
  res.json(result);
});

export const getBookByIdController = asyncHandler(async (req, res) => {
  try {
    const id = parseIdParam(req);
    const book = await service.getBookById(id);
    res.json(book);
  } catch (e) {
    errorResponse(res, e);
  }
});

export const getBooksByCategoryController = asyncHandler(async (req, res) => {
  res.json(await service.getBooksByCategory(req.params.categoryName as string));
});

export const getBooksByAuthorController = asyncHandler(async (req, res) => {
  res.json(await service.getBooksByAuthor(req.params.authorName as string));
});

export const getBooksBySeriesController = asyncHandler(async (req, res) => {
  res.json(await service.getBooksBySeries(req.params.seriesName as string));
});

export const createBookController = asyncHandler(async (req, res) => {
  const book = await service.createBook(req.body);
  res.status(201).json(book);
});

export const updateBookController = asyncHandler(async (req, res) => {
  try {
    const id = parseIdParam(req);
    const book = await service.updateBook(id, req.body);
    res.json(book);
  } catch (e) {
    errorResponse(res, e);
  }
});

export const deleteBookController = asyncHandler(async (req, res) => {
  try {
    const id = parseIdParam(req);
    await service.deleteBook(id);
    res.status(204).send();
  } catch (e) {
    errorResponse(res, e);
  }
});

export const searchBookCoversController = asyncHandler(async (req, res) => {
  try {
    const id = parseIdParam(req);
    const covers = await service.searchBookCoversByMetadata(id);
    res.json(covers);
  } catch (e) {
    errorResponse(res, e);
  }
});

export const searchBookCoversByQueryController = asyncHandler(
  async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        res.status(400).json({ message: 'Query parameter "q" is required' });
        return;
      }

      const covers = await service.searchBookCoversByCustomQuery(query);
      res.json(covers);
    } catch (e) {
      errorResponse(res, e);
    }
  },
);

export const scanLibraryController = asyncHandler(async (_req, res) => {
  try {
    if (!libraryConfig.libraryPath) {
      res.status(400).json({
        message:
          "No se ha configurado LIBRARY_PATH en las variables de entorno",
      });
      return;
    }

    const results = await service.scanLibraryFolder();
    res.json({
      message: "Escaneo completado",
      libraryPath: libraryConfig.libraryPath,
      ...results,
    });
  } catch (e: any) {
    res.status(500).json({
      message: "Error al escanear biblioteca",
      error: e?.message ?? "Unknown error",
    });
  }
});

/**
 * Sirve el archivo digital del libro (EPUB, PDF, etc.)
 * Solo para libros que tengan filePath
 */
const LIBRARY_ROOT = path.resolve(
  process.env.LIBRARY_PATH ?? path.join(process.cwd(), "storage", "library"),
);

function isInsideLibrary(filePath: string) {
  const resolved = path.resolve(filePath);
  const root = LIBRARY_ROOT.endsWith(path.sep)
    ? LIBRARY_ROOT
    : LIBRARY_ROOT + path.sep;
  return resolved.startsWith(root);
}

function getContentType(ext: string) {
  switch (ext) {
    case ".epub":
      return "application/epub+zip";
    case ".pdf":
      return "application/pdf";
    case ".mobi":
      return "application/x-mobipocket-ebook";
    case ".azw3":
      return "application/vnd.amazon.ebook";
    default:
      return "application/octet-stream";
  }
}

function safeFilename(name: string) {
  return name.replace(/[^\w\s.-]/g, "").trim() || "book";
}

function makeEtag(stat: fs.Stats, filePath: string) {
  const base = `${filePath}:${stat.size}:${stat.mtimeMs}`;
  return crypto.createHash("sha1").update(base).digest("hex");
}

export const getBookFileController = async (req: Request, res: Response) => {
  try {
    const bookId = Number(req.params.id);
    if (Number.isNaN(bookId)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const book = await service.getBookById(bookId);

    if (!book.filePath) {
      return res
        .status(404)
        .json({ message: "Este libro no tiene archivo digital asociado" });
    }

    // ✅ Seguridad: servir solo desde LIBRARY_ROOT
    if (!isInsideLibrary(book.filePath)) {
      return res.status(403).json({ message: "Ruta de archivo no permitida" });
    }

    if (!fs.existsSync(book.filePath)) {
      return res
        .status(404)
        .json({ message: "Archivo no encontrado en el sistema de archivos" });
    }

    const stat = fs.statSync(book.filePath);
    const fileSize = stat.size;

    const ext = path.extname(book.filePath).toLowerCase();
    const isEpubRoute = req.originalUrl.endsWith("/file.epub"); // ✅ clave
    const contentType = isEpubRoute
      ? "application/epub+zip"
      : getContentType(ext);

    const filename = `${safeFilename(book.title)}${isEpubRoute ? ".epub" : ext}`;

    // Headers base
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Accept-Ranges", "bytes");

    // Cache
    const etag = makeEtag(stat, book.filePath);
    res.setHeader("ETag", etag);
    res.setHeader("Last-Modified", stat.mtime.toUTCString());
    res.setHeader("Cache-Control", "private, max-age=3600");

    // 304 si coincide
    const ifNoneMatch = req.headers["if-none-match"];
    if (ifNoneMatch && ifNoneMatch === etag) {
      return res.status(304).end();
    }

    const range = req.headers.range;

    // Sin Range => stream completo
    if (!range) {
      res.setHeader("Content-Length", fileSize);
      return fs.createReadStream(book.filePath).pipe(res);
    }

    // Range: bytes=start-end
    const match = /^bytes=(\d+)-(\d*)$/.exec(range);
    if (!match) {
      res.setHeader("Content-Range", `bytes */${fileSize}`);
      return res.status(416).end();
    }

    const start = Number(match[1]);
    const end = match[2] ? Number(match[2]) : fileSize - 1;

    if (
      Number.isNaN(start) ||
      Number.isNaN(end) ||
      start < 0 ||
      end < 0 ||
      start > end ||
      end >= fileSize
    ) {
      res.setHeader("Content-Range", `bytes */${fileSize}`);
      return res.status(416).end();
    }

    const chunkSize = end - start + 1;

    res.status(206);
    res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
    res.setHeader("Content-Length", chunkSize);

    return fs.createReadStream(book.filePath, { start, end }).pipe(res);
  } catch (error: any) {
    console.error("Error serving book file:", error);
    res.status(error.status || 500).json({
      message: error.message || "Error al servir el archivo del libro",
    });
  }
};
// export const getBookFileController = async (req: Request, res: Response) => {
//   try {
//     const bookId = Number(req.params.id);

//     if (Number.isNaN(bookId)) {
//       return res.status(400).json({ message: 'Invalid book ID' });
//     }

//     const book = await service.getBookById(bookId);

//     // Verificar que el libro tiene archivo digital
//     if (!book.filePath) {
//       return res.status(404).json({
//         message: 'Este libro no tiene archivo digital asociado',
//       });
//     }

//     // Verificar que el archivo existe en el sistema
//     if (!fs.existsSync(book.filePath)) {
//       return res.status(404).json({
//         message: 'Archivo no encontrado en el sistema de archivos',
//       });
//     }

//     // Obtener la extensión para el Content-Type
//     const ext = path.extname(book.filePath).toLowerCase();

//     let contentType = 'application/octet-stream';
//     switch (ext) {
//       case '.epub':
//         contentType = 'application/epub+zip';
//         break;
//       case '.pdf':
//         contentType = 'application/pdf';
//         break;
//       case '.mobi':
//         contentType = 'application/x-mobipocket-ebook';
//         break;
//       case '.azw3':
//         contentType = 'application/vnd.amazon.ebook';
//         break;
//     }

//     // Configurar headers
//     res.setHeader('Content-Type', contentType);
//     res.setHeader(
//       'Content-Disposition',
//       `inline; filename="${book.title}${ext}"`,
//     );

//     // Habilitar CORS para el archivo
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET');

//     // Enviar el archivo
//     res.sendFile(book.filePath);
//   } catch (error: any) {
//     console.error('Error serving book file:', error);
//     res.status(error.status || 500).json({
//       message: error.message || 'Error al servir el archivo del libro',
//     });
//   }
// };
