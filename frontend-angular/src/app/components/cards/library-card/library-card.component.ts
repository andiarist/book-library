import { Component, computed, inject, input } from '@angular/core';
import { environment } from '@environments/environment';
import { LibraryBooksService } from 'src/app/services/library-books.service';
import { Book } from 'src/app/types/domain.types';

@Component({
  selector: 'library-card',
  imports: [],
  templateUrl: './library-card.component.html',
})
export class LibraryCardComponent {
  book = input.required<Book>();

  coverUrl = computed(() => {
    const cover = this.book().coverPath;
    return cover ? `${environment.baseApiUrl}${cover}` : '';
  });
}
