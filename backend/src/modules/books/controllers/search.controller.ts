import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/async-handler';
import { requireQueryParam } from '../validators/books.validators';
import { searchBookByIsbn, searchBookByText } from '../services';

/**
 * Busca un libro por ISBN en fuentes externas
 */
export const searchBookByIsbnController = asyncHandler(
  async (req: Request, res: Response) => {
    const isbn = req.params.isbn;
    const book = await searchBookByIsbn(isbn as string);
    res.json(book);
  },
);

/**
 * Busca libros por texto en fuentes externas
 */
export const searchBooksByTextController = asyncHandler(
  async (req: Request, res: Response) => {
    const query = requireQueryParam(req, 'q');
    const results = await searchBookByText(query);
    res.json(results);
  },
);
