import { Request, Response, NextFunction } from "express";
import * as service from "./books.service";
import { libraryConfig } from "../../config/library";

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

export const getAllBooksController = asyncHandler(async (_req, res) => {
  res.json(await service.getAllBooks());
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
