import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { useFormControlUi } from '../primitives/use-form-control-ui';

@Component({
  selector: 'app-textarea',
  imports: [ReactiveFormsModule],
  templateUrl: './textarea.component.html',
})
export class TextareaComponent<T = string> {
  id = input.required<string>();
  control = input.required<FormControl<T>>();

  loading = input(false);
  disabled = input(false);
  customClass = input('');

  placeholder = input('');
  rows = input(3);

  ariaLabel = input<string | undefined>(undefined);
  ariaDescribedBy = input<string | undefined>(undefined);
  ariaInvalid = input<boolean | undefined>(undefined);

  ui = useFormControlUi({
    customClass: this.customClass,
    loading: this.loading,
    disabled: this.disabled,
  });
}
