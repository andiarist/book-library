import { Router } from 'express';
import {
  searchBookByIsbnController,
  getAllBooksController,
  getBookByIdController,
  getBooksByCategoryController,
  getBooksByAuthorController,
  getBooksBySeriesController,
  createBookController,
  updateBookController,
  deleteBookController,
  searchBooksByTextController,
  scanLibraryController,
  searchBookCoversController,
  searchBookCoversByQueryController,
  getBookFileController,
} from './books.controller';

const router = Router();

// Búsquedas externas
router.get('/search/isbn/:isbn', searchBookByIsbnController);
router.get('/search/text', searchBooksByTextController);
router.get('/search/covers', searchBookCoversByQueryController);

// Escaneo de biblioteca local
router.post('/scan', scanLibraryController);

// Filtros por entidades relacionadas
router.get('/category/:categoryName', getBooksByCategoryController);
router.get('/author/:authorName', getBooksByAuthorController);
router.get('/series/:seriesName', getBooksBySeriesController);

// CRUD de libros
router.get('/', getAllBooksController);
router.post('/', createBookController);

// Servir archivo digital del libro
router.get('/:id/file', getBookFileController);

// Rutas con /:id AL FINAL (para no capturar otras rutas)
router.get('/:id/covers', searchBookCoversController);
router.get('/:id', getBookByIdController);
router.patch('/:id', updateBookController);
router.delete('/:id', deleteBookController);

export default router;
