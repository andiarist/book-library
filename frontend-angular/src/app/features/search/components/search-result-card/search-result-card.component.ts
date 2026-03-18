import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { BookInfoItemComponent } from 'src/app/shared/ui/book-info-item/book-info-item.component';
import { SearchBooksService } from '../../services/search.service';
import type { BookMetadataDTO, BookAddDTO } from '../../models/search.types';

@Component({
  selector: 'search-result-card',
  imports: [BookInfoItemComponent],
  templateUrl: './search-result-card.component.html',
})
export class SearchResultCardComponent {
  private router = inject(Router);

  book = input.required<BookMetadataDTO>();

  searchBookService = inject(SearchBooksService);

  addBook() {
    //transformar BookMetaData en CreateBook
    const createBook: BookAddDTO = {
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
