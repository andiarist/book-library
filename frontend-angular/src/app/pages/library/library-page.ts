import { Component, inject } from '@angular/core';
import { LibraryBooksService } from '../../services/library-books.service';
import { LibraryCardComponent } from 'src/app/components/cards/library-card/library-card.component';

@Component({
  selector: 'library-page',
  imports: [LibraryCardComponent],
  templateUrl: './library-page.html',
})
export default class LibraryPage {
  booksLibraryService = inject(LibraryBooksService);
}
