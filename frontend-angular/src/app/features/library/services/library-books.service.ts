import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Book, BookDTO, ScanLibraryResponse } from '../models/library.types';
import { map, Observable } from 'rxjs';
import { PaginatedResponse } from 'src/app/shared/models/pagination.types';
import { BookMapper } from '../mappers/book.mapper';

@Injectable({ providedIn: 'root' })
export class LibraryBooksService {
  private http = inject(HttpClient);

  libraryBooks = signal<PaginatedResponse<Book>>({
    data: [],
    pagination: {
      page: 0,
      limit: 0,
      total: 0,
      totalPages: 0,
    },
  });
  libraryBooksLoading = signal(true);

  constructor() {
    this.loadLibraryBooks();
    console.log('Servicio creado');
  }

  loadLibraryBooks() {
    this.http
      .get<PaginatedResponse<BookDTO>>(`${environment.baseApiUrl}${environment.booksUrl}`)
      .pipe(
        map((resp) => {
          return {
            data: BookMapper.mapBookDtoToBookArray(resp.data),
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
  scanLibraryBooks(): Observable<ScanLibraryResponse> {
    return this.http.post<ScanLibraryResponse>(
      `${environment.baseApiUrl}${environment.booksUrl}/scan`,
      {},
    );
  }
}
