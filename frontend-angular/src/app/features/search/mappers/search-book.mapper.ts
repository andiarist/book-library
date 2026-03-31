import { BookMetadataDTO, BookAddDTO } from '../models/search.types';

export class SearchBookMapper {
  static mapBookMetadataDTOToBookAddDTO(book: BookMetadataDTO): BookAddDTO {
    return {
      title: book.title,
      authors: book.authors,
      categories: book.categories,
      publisher: book.publisher,
      publishYear: book.publishYear,
      pageCount: book.pageCount,
      description: book.description,
      isbn: book.isbn,
      format: 'PHYSICAL',
      imageUrl: book.imageUrl || undefined,
    };
  }
}
