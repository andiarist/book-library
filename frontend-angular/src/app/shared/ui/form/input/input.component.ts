import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { useFormControlUi } from '../primitives/use-form-control-ui';

@Component({
  selector: 'app-input',
  imports: [ReactiveFormsModule],
  templateUrl: './input.component.html',
})
export class InputComponent<T = string> {
  id = input.required<string>();
  control = input.required<FormControl<T>>();

  loading = input(false);
  disabled = input(false);
  customClass = input('');

  type = input<'text' | 'password' | 'number' | 'email'>('text');
  placeholder = input('');

  ariaLabel = input<string | undefined>(undefined);
  ariaDescribedBy = input<string | undefined>(undefined);
  ariaInvalid = input<boolean | undefined>(undefined);

  ui = useFormControlUi({
    customClass: this.customClass,
    loading: this.loading,
    disabled: this.disabled,
  });
}
