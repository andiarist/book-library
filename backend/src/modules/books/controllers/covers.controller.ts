import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/async-handler';
import {
  searchBookCoversByCustomQuery,
  searchBookCoversByMetadata,
} from '../services';
import { parseBookId, requireQueryParam } from '../validators/books.validators';

/**
 * Busca portadas para un libro específico basándose en sus metadatos
 */
export const searchBookCoversController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseBookId(req);
    const covers = await searchBookCoversByMetadata(id);
    res.json(covers);
  },
);

/**
 * Busca portadas usando una query personalizada
 */
export const searchBookCoversByQueryController = asyncHandler(
  async (req: Request, res: Response) => {
    const query = requireQueryParam(req, 'q');
    const covers = await searchBookCoversByCustomQuery(query);
    res.json(covers);
  },
);
