import { Component, input, output } from '@angular/core';
import { ScanLibraryResult } from 'src/app/types/domain.types';

@Component({
  selector: 'scan-modal',
  imports: [],
  templateUrl: './scan-modal.component.html',
})
export class ScanModalComponent {
  onCloseModal = output<void>();
  results = input.required<ScanLibraryResult>();
}
