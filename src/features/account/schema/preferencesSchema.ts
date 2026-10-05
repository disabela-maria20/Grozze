import { z } from 'zod';

/** Options come from the Grozze API, so any listed name is accepted. */
export const preferencesSchema = z.object({
  language: z.string().min(1, 'Escolha um idioma.'),
  format: z.string().min(1, 'Escolha uma experiência.'),
  genres: z.array(z.string()),
});

export type PreferencesValues = z.input<typeof preferencesSchema>;
