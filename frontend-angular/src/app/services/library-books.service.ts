import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Book, PAGINATED_BOOK_INIT, PaginatedBookResponse } from '../types/domain.types';
import { BookMapper } from '../mapper/book.mapper';
import { map } from 'rxjs';
import { BookDTO, PaginatedBookResponseDTO } from '../types/api.types';

@Injectable({ providedIn: 'root' })
export class LibraryBooksService {
  private http = inject(HttpClient);

  libraryBooks = signal<PaginatedBookResponse<Book>>(PAGINATED_BOOK_INIT);
  libraryBooksLoading = signal(true);

  constructor() {
    this.loadLibraryBooks();
    console.log('Servicio creado');
  }

  loadLibraryBooks() {
    this.http
      .get<PaginatedBookResponseDTO<BookDTO>>(`${environment.baseApiUrl}${environment.booksUrl}`)
      .pipe(
        map((resp) => {
          return {
            data: BookMapper.mapBookDtoToBookArray(resp.books),
            pagination: resp.pagination,
          };
        }),
      )
      .subscribe((resp) => {
        console.log(resp);
        this.libraryBooks.set(resp);
        this.libraryBooksLoading.set(false);
      });
  }
}
