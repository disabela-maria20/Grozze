import type { GrozzeItem } from './grozzeTypes';

/** "Todos" means no preference, saved as `null`. */
const NO_PREFERENCE = 'Todos';

/** Id of the option named `name`; `null` for "Todos" or a name not in the list. */
export function optionId(options: GrozzeItem[], name: string): number | null {
  if (name === NO_PREFERENCE) return null;
  return options.find((option) => option.nome === name)?.id ?? null;
}

/** Ids of the options named in `names` (unknown names are skipped). */
export function optionIds(options: GrozzeItem[], names: string[]): number[] {
  return options
    .filter((option) => names.includes(option.nome))
    .map((option) => option.id);
}
