import { safeImage, validDate, videoId } from '@/shared/lib/catalog';
import { z } from 'zod';

/** Client-side mirror of `validateOverride` so errors show next to each field. */
const text = z.string().trim().max(10000, 'Campo muito longo.');

const imageUrl = text.refine(
  (v) => !v || !!safeImage(v),
  'Use uma URL HTTPS válida para imagens.'
);

export const cmsMovieSchema = z.object({
  t: text,
  releaseDate: text.refine(
    (v) => !v || validDate(v),
    'Informe uma data de estreia válida.'
  ),
  director: text,
  cast: text,
  genre: text,
  dur: text,
  rating: text,
  poster: imageUrl,
  backdrop: imageUrl,
  trailer: text.refine(
    (v) => !v || !!videoId(v),
    'Informe um ID ou link válido do YouTube.'
  ),
  syn: text,
});

export type CmsMovieValues = z.input<typeof cmsMovieSchema>;
