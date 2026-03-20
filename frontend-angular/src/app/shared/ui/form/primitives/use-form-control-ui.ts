import { computed, type Signal } from '@angular/core';
import { cn } from 'src/app/shared/utils/cn.utils';

interface FormControlUiOptions {
  customClass: Signal<string>;
  loading: Signal<boolean>;
  disabled: Signal<boolean>;
}

export function useFormControlUi(options: FormControlUiOptions) {
  const isDisabled = computed(() => options.disabled() || options.loading());

  const classes = computed(() =>
    cn(
      //Base
      'w-full px-4 py-2 border rounded-lg transition-all outline-none',
      'border-gray-300 bg-white',
      'focus:ring-2 focus:ring-amber-400',

      //Disabled
      isDisabled() && 'opacity-50 cursor-not-allowed bg-gray-100',

      //Custom
      options.customClass(),
    ),
  );

  return {
    isDisabled,
    classes,
  };
}
