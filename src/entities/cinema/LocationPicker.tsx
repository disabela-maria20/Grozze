'use client';

import type { Ref } from 'react';
import type { LocationOption } from './model';
import { Field, inputClass } from '@/shared/ui';

export interface PickedPlace {
  uf: string;
  /** Empty until the user picks a city of `uf`. */
  city: string;
}

/**
 * State and city selects, with full state names. Picking a state clears the
 * city, unless the state has a single city, which is picked right away.
 */
export function LocationPicker({
  options,
  value,
  onChange,
  stateRef,
  className = '',
}: {
  options: LocationOption[];
  value: PickedPlace;
  onChange: (place: PickedPlace) => void;
  stateRef?: Ref<HTMLSelectElement>;
  className?: string;
}) {
  const cities = options.find((option) => option.uf === value.uf)?.cities ?? [];
  return (
    <div className={className}>
      <Field label="Estado">
        <select
          ref={stateRef}
          className={inputClass}
          value={value.uf}
          onChange={(event) => {
            const uf = event.target.value;
            const only = options.find((option) => option.uf === uf)?.cities;
            onChange({ uf, city: only?.length === 1 ? only[0] : '' });
          }}
        >
          <option value="" disabled>
            Selecione o estado
          </option>
          {options.map((option) => (
            <option key={option.uf} value={option.uf}>
              {option.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Cidade">
        <select
          className={inputClass}
          value={value.city}
          disabled={!value.uf}
          onChange={(event) =>
            onChange({ uf: value.uf, city: event.target.value })
          }
        >
          <option value="" disabled>
            {value.uf ? 'Selecione a cidade' : 'Escolha o estado primeiro'}
          </option>
          {cities.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}
