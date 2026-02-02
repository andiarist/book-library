import { Router } from 'express';
import {
  searchBookByIsbnController,
  getAllBooksController,
  getBookByIdController,
  getBooksByCategoryController,
  getBooksByAuthorController,
  getBooksBySeriesController,
  createBookController,
} from './books.controller';

const router = Router();

router.get('/search/isbn/:isbn', searchBookByIsbnController);
router.get('/', getAllBooksController);
router.get('/:id', getBookByIdController);
router.get('/category/:categoryName', getBooksByCategoryController);
router.get('/author/:authorName', getBooksByAuthorController);
router.get('/series/:seriesName', getBooksBySeriesController);
router.post('/', createBookController);

export default router;
