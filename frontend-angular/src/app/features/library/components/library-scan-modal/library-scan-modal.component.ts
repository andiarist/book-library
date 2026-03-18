import { Component, input, output } from '@angular/core';
import type { ScanLibraryResponse } from '../../models/library.types';

@Component({
  selector: 'library-scan-modal',
  imports: [],
  templateUrl: './library-scan-modal.component.html',
})
export class LibraryScanModalComponent {
  onCloseModal = output<void>();
  results = input.required<ScanLibraryResponse>();
}
