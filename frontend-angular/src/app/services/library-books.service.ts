import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LibraryBooksService {
  private http = inject(HttpClient);

  constructor() {
    this.loadLibraryBooks();
    console.log('Servicio creado');
  }

  loadLibraryBooks() {
    this.http.get(`${environment.baseApiUrl}/api/books`).subscribe((resp) => {
      console.log({ resp });
    });
  }
}
