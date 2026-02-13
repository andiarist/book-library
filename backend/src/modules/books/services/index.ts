/**
 * Barrel file que reexporta todas las funciones de los servicios
 * Esto permite importar desde un solo lugar: import * as service from './services'
 */

// CRUD principal de libros
export {
  getAllBooks,
  getBookById,
  getBooksByCategory,
  getBooksByAuthor,
  getBooksBySeries,
  createBook,
  updateBook,
  deleteBook,
  type BookFilters,
} from './books.service';

// Búsquedas externas
export { searchBookByIsbn, searchBookByText } from './search.service';

// Búsqueda de portadas
export {
  searchBookCoversByMetadata,
  searchBookCoversByCustomQuery,
} from './covers.service';

// Escaneo de biblioteca
export { scanLibraryFolder } from './scan.service';

// Utilidades compartidas (si necesitas exportarlas)
export { HttpError, toHttpError } from './utils/service-utils';
