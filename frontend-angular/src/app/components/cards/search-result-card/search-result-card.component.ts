import { Component, inject, input } from '@angular/core';
import type { BookMetadata, CreateBookDTO } from 'src/app/types/api.types';
import { BookInfoItemComponent } from '../../book-info-item/book-info-item.component';
import { SearchBooksService } from 'src/app/services/search.service';
import { Router } from '@angular/router';

@Component({
  selector: 'search-result-card',
  imports: [BookInfoItemComponent],
  templateUrl: './search-result-card.component.html',
})
export class SearchResultCardComponent {
  private router = inject(Router);

  book = input.required<BookMetadata>();

  searchBookService = inject(SearchBooksService);

  addBook() {
    //transformar BookMetaData en CreateBook
    const createBook: CreateBookDTO = {
      title: this.book().title,
      authors: this.book().authors,
      categories: this.book().categories,
      publisher: this.book().publisher,
      publishYear: this.book().publishYear,
      pageCount: this.book().pageCount,
      description: this.book().description,
      isbn: this.book().isbn,
      format: 'PHYSICAL',
      imageUrl: this.book().imageUrl || undefined,
    };

    //llamar al servicio
    this.searchBookService.addBookToLibrary(createBook).subscribe({
      next: () => {
        this.router.navigate(['library']);
      },
      error: () => {
        alert('No se ha podido agregar');
      },
    });
  }
}
