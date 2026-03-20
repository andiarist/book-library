import { Component, computed, input } from '@angular/core';
import { cn } from 'src/app/shared/utils/cn.utils';

@Component({
  selector: 'app-form-field',
  imports: [],
  templateUrl: './form-field.component.html',
})
export class FormFieldComponent {
  label = input.required<string>();
  for = input.required<string>();
  display = input<'row' | 'col'>('col');
  wrapperCustomClass = input('');
  labelCustomClass = input('');

  errorMsg = input('');
  showError = input(false);

  wrapperClass = computed(() =>
    cn(
      'flex',
      this.display() === 'col' ? 'flex-col' : 'flex-row items-center',
      this.wrapperCustomClass(),
    ),
  );
  labelClass = computed(() =>
    cn(this.display() === 'col' ? 'pb-2' : 'pr-2', this.labelCustomClass()),
  );
}
