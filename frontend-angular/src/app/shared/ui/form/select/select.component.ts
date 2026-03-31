import { Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { cn } from 'src/app/shared/utils/cn.utils';

@Component({
  selector: 'app-select',
  imports: [ReactiveFormsModule],
  templateUrl: './select.component.html',
})
export class SelectComponent {
  id = input.required<string>();
  control = input.required<FormControl<string>>();
  options = input.required<{ label: string; value: string }[]>();

  customClass = input('');

  selectClass = computed(() =>
    cn(
      //Base
      'w-full px-4 py-2 border rounded-lg transition-all outline-none',
      'border-gray-300 bg-white',
      'focus:ring-2 focus:ring-amber-400',

      //Custom
      this.customClass(),
    ),
  );
}
