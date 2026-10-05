'use client';

import type { UseFormRegisterReturn } from 'react-hook-form';
import { useGrozzeListQuery } from '@/shared/api';
import { genres } from '@/shared/lib/catalog';
import { FieldError } from './FieldError';

/**
 * Multi-select of movie genres rendered as toggle chips (checkboxes). Genres
 * come from the Grozze API; until it answers, the catalog's genres are used.
 */
export function GenrePicker({
  label,
  error,
  inputProps,
}: {
  label: string;
  error?: string;
  inputProps: UseFormRegisterReturn;
}) {
  const { data: apiGenres } = useGrozzeListQuery('movieGenres');
  const options = apiGenres?.map((genre) => genre.nome) ?? genres();
  return (
    <fieldset className="mb-4 min-w-0">
      <legend className="text-[#b4c0b6] text-[13px] mb-2">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((genre) => (
          <label key={genre} className="cursor-pointer">
            <input
              type="checkbox"
              value={genre}
              className="peer sr-only"
              {...inputProps}
            />
            <span className="inline-flex items-center min-h-9 px-3.5 rounded-full border border-line bg-surface2 text-[13px] text-[#cbd5cd] transition-colors peer-checked:bg-lime peer-checked:text-[#081004] peer-checked:border-lime peer-checked:font-bold peer-focus-visible:outline-2 peer-focus-visible:outline-lime">
              {genre}
            </span>
          </label>
        ))}
      </div>
      <FieldError message={error} />
    </fieldset>
  );
}
