import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { BookAddDTO, BookMetadataDTO } from '../../models/search.types';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SearchBookMapper } from '../../mappers/search-book.mapper';
import { SearchBooksService } from '../../services/search.service';
import { Router } from '@angular/router';
import { ButtonComponent } from 'src/app/shared/ui/button/button.component';
import { InputComponent } from 'src/app/shared/ui/form/input/input.component';
import { TextareaComponent } from 'src/app/shared/ui/form/textarea/textarea.component';

@Component({
  selector: 'search-add-book-modal',
  imports: [ReactiveFormsModule, ButtonComponent, InputComponent, TextareaComponent],
  templateUrl: './search-add-book-modal.component.html',
})
export class SearchAddBookModalComponent {
  private router = inject(Router);
  searchBookService = inject(SearchBooksService);
  book = input.required<BookMetadataDTO>();
  selectBook = output<BookMetadataDTO | null>();

  bookForm = new FormGroup({
    title: new FormControl('', { nonNullable: true }),
    authors: new FormControl('', { nonNullable: true }),
    isbn: new FormControl(''),
    publisher: new FormControl(''),
    pageCount: new FormControl(0),
    description: new FormControl(''),
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

  onSubmit() {
    const requiredField = this.bookForm.value.title?.trim();
    if (requiredField) {
      console.log('SUCCES: ', this.bookForm.value);
      this.addBook();
    } else {
      console.log('ERROR:  ', this.bookForm.value);
    }
  }

  addBook() {
    //Mapeamos el formulario a MetadataDTO
    const parsedBook: BookMetadataDTO = {
      title: this.bookForm.value.title ?? '',
      authors: this.bookForm.value.authors?.trim().split(',') ?? [],
      isbn: this.bookForm.value.isbn ?? '',
      publisher: this.bookForm.value.publisher ?? '',
      pageCount: this.bookForm.value.pageCount ?? 0,
      description: this.bookForm.value.description ?? '',
      categories: [],
    };
    const newBook: BookAddDTO = SearchBookMapper.mapBookMetadataDTOToBookAddDTO(parsedBook);

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
