import { z } from 'zod';
import { CITY_OPTIONS } from './CITY_OPTIONS';

export const locationSchema = z.object({
  city: z.enum(CITY_OPTIONS, 'Escolha uma cidade.'),
});

export type LocationValues = z.input<typeof locationSchema>;
