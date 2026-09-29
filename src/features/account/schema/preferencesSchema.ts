import { z } from 'zod';
import { FORMAT_OPTIONS } from './FORMAT_OPTIONS';
import { LANGUAGE_OPTIONS } from './LANGUAGE_OPTIONS';

export const preferencesSchema = z.object({
  language: z.enum(LANGUAGE_OPTIONS, 'Escolha um idioma.'),
  format: z.enum(FORMAT_OPTIONS, 'Escolha uma experiência.'),
});

export type PreferencesValues = z.input<typeof preferencesSchema>;
