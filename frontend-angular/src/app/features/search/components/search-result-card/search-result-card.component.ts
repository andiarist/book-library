import { Component, inject, input, output } from '@angular/core';
import { BookInfoItemComponent } from 'src/app/shared/ui/book-info-item/book-info-item.component';
import type { BookMetadataDTO } from '../../models/search.types';
import { SearchBooksService } from '../../services/search.service';

@Component({
  selector: 'search-result-card',
  imports: [BookInfoItemComponent],
  templateUrl: './search-result-card.component.html',
})
export class SearchResultCardComponent {
  book = input.required<BookMetadataDTO>();
  selectBook = output<BookMetadataDTO | null>();

  searchBookService = inject(SearchBooksService);
}
