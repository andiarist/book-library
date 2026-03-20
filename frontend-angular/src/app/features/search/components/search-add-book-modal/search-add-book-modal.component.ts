import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { BookAddDTO, BookMetadataDTO } from '../../models/search.types';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SearchBookMapper } from '../../mappers/search-book.mapper';
import { SearchBooksService } from '../../services/search.service';
import { Router } from '@angular/router';
import { ButtonComponent } from 'src/app/shared/ui/button/button.component';
import { InputComponent } from 'src/app/shared/ui/form/input/input.component';
import { TextareaComponent } from 'src/app/shared/ui/form/textarea/textarea.component';
import { FormFieldComponent } from 'src/app/shared/ui/form/form-field/form-field.component';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'search-add-book-modal',
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    TextareaComponent,
    FormFieldComponent,
  ],
  templateUrl: './search-add-book-modal.component.html',
})
export class SearchAddBookModalComponent {
  private router = inject(Router);
  searchBookService = inject(SearchBooksService);
  book = input.required<BookMetadataDTO>();
  selectBook = output<BookMetadataDTO | null>();

  bookForm = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1)],
    }),
    authors: new FormControl('', { nonNullable: true }),
    isbn: new FormControl('', { nonNullable: true }),
    publisher: new FormControl('', { nonNullable: true }),
    pageCount: new FormControl(0, { nonNullable: true }),
    description: new FormControl('', { nonNullable: true }),
  });

  ngOnInit(): void {
    this.bookForm.patchValue({
      title: this.book().title,
      authors: this.book().authors.join(', '),
      isbn: this.book().isbn,
      publisher: this.book().publisher,
      pageCount: this.book().pageCount,
      description: this.book().description,
    });
  }

  showValidationErrors = signal(false);
  titleText = toSignal(this.bookForm.controls.title.valueChanges);

  efecto = effect(() => {
    this.titleText();
    untracked(() => {
      if (this.showValidationErrors()) this.showValidationErrors.set(false);
    });
  });

  showErrorMsg = computed(() => {
    if (!this.showValidationErrors()) return false;
    return this.bookForm.controls.title.invalid;
  });

  onSubmit() {
    this.showValidationErrors.set(true);
    if (this.bookForm.invalid) {
      console.log('ERROR:  ', this.bookForm.value);
    } else {
      console.log('SUCCES: ', this.bookForm.value);
      this.addBook();
    }
  }

  addBook() {
    //Mapeamos el formulario a MetadataDTO
    const formVal = this.bookForm.getRawValue();
    const parsedBook: BookMetadataDTO = {
      ...formVal,
      authors:
        formVal.authors && formVal.authors.length > 0 ? formVal.authors.trim().split(',') : [],

      categories: [],
    };
    console.log('parsedBook: ', parsedBook);
    const newBook: BookAddDTO = SearchBookMapper.mapBookMetadataDTOToBookAddDTO(parsedBook);

    console.log('newBook: ', newBook);
    //llamar al servicio
    this.searchBookService.addBookToLibrary(newBook).subscribe({
      next: () => {
        this.router.navigate(['library']);
      },
      error: () => {
        alert('No se ha podido agregar');
      },
    });
  }

  closeModal() {
    this.selectBook.emit(null);
  }
}
