import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/async-handler';
import {
  parseBookId,
  parsePaginationParams,
  parseSortParams,
} from '../validators/books.validators';
import * as service from '../services/books.service';

/**
 * Obtiene todos los libros con paginación y filtros
 */
export const getAllBooksController = asyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit } = parsePaginationParams(req);
    const { sortBy, sortOrder } = parseSortParams(req);

    const search = req.query.search as string | undefined;
    const format = req.query.format as string | undefined;

    const result = await service.getAllBooks(page, limit, {
      search,
      format,
      sortBy,
      sortOrder,
    });

    res.json(result);
  },
);

/**
 * Obtiene un libro por ID
 */
export const getBookByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseBookId(req);
    const book = await service.getBookById(id);
    res.json(book);
  },
);

/**
 * Obtiene libros por categoría
 */
export const getBooksByCategoryController = asyncHandler(
  async (req: Request, res: Response) => {
    const categoryName = req.params.categoryName;
    const books = await service.getBooksByCategory(categoryName as string);
    res.json(books);
  },
);

/**
 * Obtiene libros por autor
 */
export const getBooksByAuthorController = asyncHandler(
  async (req: Request, res: Response) => {
    const authorName = req.params.authorName;
    const books = await service.getBooksByAuthor(authorName as string);
    res.json(books);
  },
);

/**
 * Obtiene libros por serie
 */
export const getBooksBySeriesController = asyncHandler(
  async (req: Request, res: Response) => {
    const seriesName = req.params.seriesName;
    const books = await service.getBooksBySeries(seriesName as string);
    res.json(books);
  },
);

/**
 * Crea un nuevo libro
 */
export const createBookController = asyncHandler(
  async (req: Request, res: Response) => {
    const book = await service.createBook(req.body);
    res.status(201).json(book);
  },
);

/**
 * Actualiza un libro existente
 */
export const updateBookController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseBookId(req);
    const book = await service.updateBook(id, req.body);
    res.json(book);
  },
);

/**
 * Elimina un libro
 */
export const deleteBookController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseBookId(req);
    await service.deleteBook(id);
    res.status(204).send();
  },
);
