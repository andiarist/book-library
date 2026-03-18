import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BookMetadataDTO } from './models/search.types';
import { SearchResultCardComponent } from './components/search-result-card/search-result-card.component';
import { SearchBooksService } from './services/search.service';

@Component({
  selector: 'search-page',
  imports: [ReactiveFormsModule, SearchResultCardComponent],
  templateUrl: './search-page.html',
})
export default class SearchPage {
  searchBooksService = inject(SearchBooksService);

  searchText = new FormControl('', { nonNullable: true });

  searchResults = signal<BookMetadataDTO[]>([]);
  searchLoading = signal(false);

  onSubmit() {
    console.log('value del input: ', this.searchText.value);
    const value = this.searchText.value.trim();
    if (!value) return;
    this.searchLoading.set(true);

    this.searchBooksService.searchBooks(value).subscribe({
      next: (resp) => {
        console.log('respuesta en el subscribe: ', resp);
        this.searchResults.set(resp);
        this.searchText.reset();
        this.searchLoading.set(false);
      },
      error: () => {
        alert('error en la búsqueda');
        this.searchLoading.set(false);
      },
    });
  }
}
