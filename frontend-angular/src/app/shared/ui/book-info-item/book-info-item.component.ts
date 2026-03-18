import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'book-info-item',
  imports: [],
  templateUrl: './book-info-item.component.html',
})
export class BookInfoItemComponent {
  label = input.required<string>();
  value = input<string | number>();

  valueToShow = computed(() => this.value() ?? '-');
}
