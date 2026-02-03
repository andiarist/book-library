import { Request, Response } from 'express';
import * as service from './books.service';

export const searchBookByIsbnController = async (
  req: Request,
  res: Response,
) => {
  try {
    const book = await service.searchBookByIsbn(req.params.isbn as string);
    res.json(book);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const searchBooksByTextController = async (
  req: Request,
  res: Response,
) => {
  const query = req.query.q as string;
  if (!query) {
    return res.status(400).json({ message: 'Query parameter "q" is required' });
  }

  const results = await service.searchBookByText(query);
  res.json(results);
};

export const getAllBooksController = async (_: Request, res: Response) => {
  res.json(await service.getAllBooks());
};

export const getBookByIdController = async (req: Request, res: Response) => {
  const book = await service.getBookById(Number(req.params.id));
  res.json(book);
};

export const getBooksByCategoryController = async (
  req: Request,
  res: Response,
) => {
  res.json(await service.getBooksByCategory(req.params.categoryName as string));
};

export const getBooksByAuthorController = async (
  req: Request,
  res: Response,
) => {
  res.json(await service.getBooksByAuthor(req.params.authorName as string));
};

export const getBooksBySeriesController = async (
  req: Request,
  res: Response,
) => {
  res.json(await service.getBooksBySeries(req.params.seriesName as string));
};

export const createBookController = async (req: Request, res: Response) => {
  const book = await service.createBook(req.body);
  res.status(201).json(book);
};

export const updateBookController = async (req: Request, res: Response) => {
  const bookId = Number(req.params.id);

  if (Number.isNaN(bookId)) {
    return res.status(400).json({ message: 'Invalid book ID' });
  }

  const book = await service.updateBook(bookId, req.body);
  res.json(book);
};

export const deleteBookController = async (req: Request, res: Response) => {
  const bookId = Number(req.params.id);
  if (Number.isNaN(bookId)) {
    return res.status(400).json({ message: 'Invalid book ID' });
  }
  await service.deleteBook(bookId);
  res.status(204).send();
};
