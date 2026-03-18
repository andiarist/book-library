import { Component, inject, signal } from '@angular/core';
import { LibraryCardComponent } from 'src/app/features/library/components/library-card/library-card.component';
import { LibraryBooksService } from './services/library-books.service';
import { LibraryScanModalComponent } from './components/library-scan-modal/library-scan-modal.component';
import { ScanLibraryResponse } from './models/library.types';

@Component({
  selector: 'library-page',
  imports: [LibraryCardComponent, LibraryScanModalComponent],
  templateUrl: './library-page.html',
})
export default class LibraryPage {
  booksLibraryService = inject(LibraryBooksService);
  // showScanModal = signal<boolean>(false);
  scanResults = signal<ScanLibraryResponse | null>(null);

  onScan() {
    this.booksLibraryService.scanLibraryBooks().subscribe((resp) => {
      this.scanResults.set(resp);
    });
  }
  onCloseModal() {
    this.scanResults.set(null);
    this.booksLibraryService.loadLibraryBooks();
  }
}
