import { Component, inject } from '@angular/core';
import { LibraryBooksService } from '../../services/library-books.service';

@Component({
  selector: 'library-page',
  imports: [],
  templateUrl: './library-page.html',
})
export default class LibraryPage {
  booksLibraryService = inject(LibraryBooksService);
}
