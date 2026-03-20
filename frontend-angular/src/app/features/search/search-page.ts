import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookMetadataDTO } from './models/search.types';
import { SearchResultCardComponent } from './components/search-result-card/search-result-card.component';
import { SearchBooksService } from './services/search.service';
import { SearchAddBookModalComponent } from './components/search-add-book-modal/search-add-book-modal.component';
import { ButtonComponent } from 'src/app/shared/ui/button/button.component';
import { InputComponent } from 'src/app/shared/ui/form/input/input.component';
import { FormFieldComponent } from 'src/app/shared/ui/form/form-field/form-field.component';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'search-page',
  imports: [
    ReactiveFormsModule,
    SearchResultCardComponent,
    SearchAddBookModalComponent,
    ButtonComponent,
    InputComponent,
    FormFieldComponent,
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
  showValidationErrors = signal(false);
  searchText = toSignal(this.searchForm.controls.searchText.valueChanges);

  efecto = effect(() => {
    this.searchText();
    untracked(() => {
      if (this.showValidationErrors()) this.showValidationErrors.set(false);
    });
  });

  showErrorMsg = computed(() => {
    if (!this.showValidationErrors()) return false;
    return this.searchForm.controls.searchText.invalid;
  });

  onSubmit() {
    this.showValidationErrors.set(true);
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
        this.showValidationErrors.set(false);
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
