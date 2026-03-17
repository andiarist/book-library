import { BookDTO } from '../types/api.types';
import { Book } from '../types/domain.types';

export class BookMapper {
  static mapBookDtoToBook(book: BookDTO): Book {
    return {
      id: book.id,
      title: book.title,
      isbn: book.isbn || null,
      format: book.format || 'PHYSICAL',
      publisher: book.publisher || null,
      publishYear: book.publishYear || null,
      pageCount: book.pageCount || null,
      description: book.description || null,
      coverPath: book.coverPath || null,
      seriesOrder: book.seriesOrder || null,
      createdAt: new Date(book.createdAt),
      updatedAt: new Date(book.updatedAt),
      authors: book.authors || [],
      categories: book.categories || [],
      series: book.series || null,
      filePath: book.filePath || null,
    };
  }
  static mapBookDtoToBookArray(books: BookDTO[]): Book[] {
    return books.map(BookMapper.mapBookDtoToBook);
  }
}
