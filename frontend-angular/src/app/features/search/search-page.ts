import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookMetadataDTO } from './models/search.types';
import { SearchResultCardComponent } from './components/search-result-card/search-result-card.component';
import { SearchBooksService } from './services/search.service';
import { SearchAddBookModalComponent } from './components/search-add-book-modal/search-add-book-modal.component';
import { ButtonComponent } from 'src/app/shared/ui/button/button.component';
import { InputComponent } from 'src/app/shared/ui/form/input/input.component';

@Component({
  selector: 'search-page',
  imports: [
    ReactiveFormsModule,
    SearchResultCardComponent,
    SearchAddBookModalComponent,
    ButtonComponent,
    InputComponent,
  ],
  templateUrl: './search-page.html',
})
export default class SearchPage {
  searchBooksService = inject(SearchBooksService);

  searchForm = new FormGroup({
    searchText: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1)],
    }),
  });

  searchResults = signal<BookMetadataDTO[]>([]);
  searchLoading = signal(false);

  // inputClasses = computed(() => {
  //   const isLoading = this.searchLoading();
  //   return cn(
  //     'w-full px-4 py-2 border rounded-lg transition-all outline-none',
  //     'border-gray-300 focus:ring-2 focus:ring-amber-400 bg-white',
  //     isLoading && 'opacity-50 cursor-not-allowed bg-gray-100',
  //   );
  // });

  onSubmit() {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }
    const value = this.searchForm.controls.searchText.value;

    this.searchLoading.set(true);
    this.searchForm.controls.searchText.disable();

    this.searchBooksService.searchBooks(value).subscribe({
      next: (resp) => {
        console.log('respuesta en el subscribe: ', resp);
        this.searchResults.set(resp);
        //this.searchForm.reset();
        this.searchLoading.set(false);
        this.searchForm.controls.searchText.enable();
      },
      error: () => {
        alert('error en la búsqueda');
        this.searchLoading.set(false);
        this.searchForm.controls.searchText.enable();
      },
    });
  }

  bookForAdd = signal<BookMetadataDTO | null>(null);
  selectBook(book: BookMetadataDTO | null) {
    this.bookForAdd.set(book);
  }
}
