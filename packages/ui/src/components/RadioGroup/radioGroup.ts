import type { ComputedRef, InjectionKey } from 'vue';

/** What a RadioGroup gives to the Radio and PlanCard inputs inside it. */
export interface RadioGroupContext {
  /** Shared `name`; same-name radios get native arrow-key navigation. */
  name: ComputedRef<string>;
  /** Currently selected value. */
  selected: ComputedRef<string | undefined>;
  disabled: ComputedRef<boolean>;
  required: ComputedRef<boolean>;
  invalid: ComputedRef<boolean>;
  /** id of the group's error message, for each input's aria-describedby. */
  errorId: ComputedRef<string | undefined>;
  select: (value: string) => void;
}

export const radioGroupKey: InjectionKey<RadioGroupContext> = Symbol('RadioGroup');
