import { useTaxStore } from './useTaxStore';
import type { TaxInputs } from '../tax/types';

// Typed accessor: returns current-year inputs and a setter for a specific section key.
export function useSection<K extends keyof TaxInputs>(key: K) {
  const { year, inputs, update } = useTaxStore();
  const value = inputs[year][key];
  const setValue = (next: TaxInputs[K]) => update(year, key, next);
  const patch = <P extends Partial<TaxInputs[K]>>(p: P) => {
    update(year, key, { ...(value as object), ...(p as object) } as TaxInputs[K]);
  };
  return { year, value, setValue, patch };
}

export function useCurrentInputs() {
  const { year, inputs } = useTaxStore();
  return { year, inputs: inputs[year] };
}
