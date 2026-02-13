import { Router } from 'express';

// Controllers
import {
  getAllBooksController,
  getBookByIdController,
  getBooksByCategoryController,
  getBooksByAuthorController,
  getBooksBySeriesController,
  createBookController,
  updateBookController,
  deleteBookController,
} from './controllers/books.controller';

import {
  searchBookByIsbnController,
  searchBooksByTextController,
} from './controllers/search.controller';

import {
  searchBookCoversController,
  searchBookCoversByQueryController,
} from './controllers/covers.controller';

import { scanLibraryController } from './controllers/scan.controller';

import { getBookFileController } from './controllers/file.controller';

const router = Router();

// ==========================================
// BÚSQUEDAS EXTERNAS
// ==========================================
router.get('/search/isbn/:isbn', searchBookByIsbnController);
router.get('/search/text', searchBooksByTextController);
router.get('/search/covers', searchBookCoversByQueryController);

// ==========================================
// ESCANEO DE BIBLIOTECA LOCAL
// ==========================================
router.post('/scan', scanLibraryController);

// ==========================================
// FILTROS POR ENTIDADES RELACIONADAS
// ==========================================
router.get('/category/:categoryName', getBooksByCategoryController);
router.get('/author/:authorName', getBooksByAuthorController);
router.get('/series/:seriesName', getBooksBySeriesController);

// ==========================================
// CRUD PRINCIPAL
// ==========================================
router.get('/', getAllBooksController);
router.post('/', createBookController);

// ==========================================
// RUTAS CON :id (al final para evitar conflictos)
// ==========================================

// Archivos digitales (con extensión .epub para compatibilidad con epubjs)
router.get('/:id/file.epub', getBookFileController);
router.get('/:id/file', getBookFileController);

// Búsqueda de portadas
router.get('/:id/covers', searchBookCoversController);

// CRUD por ID
router.get('/:id', getBookByIdController);
router.patch('/:id', updateBookController);
router.delete('/:id', deleteBookController);

export default router;
