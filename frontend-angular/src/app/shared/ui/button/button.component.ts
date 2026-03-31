import { Component, computed, input, output } from '@angular/core';
import { cn } from '../../utils/cn.utils';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.component.html',
})
export class ButtonComponent {
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input(false);
  loading = input(false);
  customClass = input('');

  onClick = output<MouseEvent>();

  btnClasses = computed(() => {
    return cn(
      'inline-flex items-center justify-center px-4 py-2 rounded font-medium bg-amber-700 text-white cursor-pointer transition-all',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      this.customClass(),
    );
  });
}
