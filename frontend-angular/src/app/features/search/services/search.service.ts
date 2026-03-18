import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import type { BookAddDTO, BookMetadataDTO } from '../models/search.types';

@Injectable({ providedIn: 'root' })
export class SearchBooksService {
  private http = inject(HttpClient);

  searchBooks(query: string): Observable<BookMetadataDTO[]> {
    return this.http.get<BookMetadataDTO[]>(
      `${environment.baseApiUrl}${environment.booksUrl}/search/text?q=${query}`,
    );
  }

  addBookToLibrary(newBook: BookAddDTO) {
    return this.http.post(`${environment.baseApiUrl}${environment.booksUrl}/`, newBook);
  }
}
