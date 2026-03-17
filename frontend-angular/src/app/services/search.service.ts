import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { BookMetadata, CreateBookDTO } from '../types/api.types';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SearchBooksService {
  private http = inject(HttpClient);

  searchBooks(query: string): Observable<BookMetadata[]> {
    return this.http.get<BookMetadata[]>(
      `${environment.baseApiUrl}${environment.booksUrl}/search/text?q=${query}`,
    );
  }

  addBookToLibrary(newBook: CreateBookDTO) {
    return this.http.post(`${environment.baseApiUrl}${environment.booksUrl}/`, newBook);
  }
}
