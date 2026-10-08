import { z } from 'zod';

/** Mirror of the backend rules so errors show next to each field. */
export const newsSchema = z.object({
  title: z.string().trim().min(1, 'Informe o título.').max(160),
  slug: z
    .string()
    .trim()
    .max(160)
    .refine(
      (v) => !v || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v),
      'Use letras minúsculas sem acento, números e hífens.'
    ),
  summary: z.string().trim().max(300),
  content: z.string().trim().min(1, 'Escreva o texto da notícia.').max(50000),
  coverImageUrl: z
    .string()
    .trim()
    .refine(
      (v) => !v || /^https?:\/\//i.test(v),
      'Use uma URL http(s) para a imagem.'
    ),
  status: z.enum(['draft', 'published']),
  /** From an `<input type="datetime-local">`; empty = let the API decide. */
  publishedAt: z.string().trim(),
  /** Catalog ids of the related movies, chosen in the picker. */
  movieIds: z.array(z.string()),
});

export type NewsFormValues = z.input<typeof newsSchema>;
