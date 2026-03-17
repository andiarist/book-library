import { Component, inject, signal } from '@angular/core';
import { LibraryBooksService } from '../../services/library-books.service';
import { LibraryCardComponent } from 'src/app/components/cards/library-card/library-card.component';
import { ScanModalComponent } from 'src/app/components/modals/scan-modal/scan-modal.component';
import { ScanLibraryResult } from 'src/app/types/domain.types';

@Component({
  selector: 'library-page',
  imports: [LibraryCardComponent, ScanModalComponent],
  templateUrl: './library-page.html',
})
export default class LibraryPage {
  booksLibraryService = inject(LibraryBooksService);
  // showScanModal = signal<boolean>(false);
  scanResults = signal<ScanLibraryResult | null>(null);

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
