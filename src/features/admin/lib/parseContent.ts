import type { ContentState } from '@/shared/lib/types';
import { validateOverride } from '@/entities/movie';

/** Validates the overrides of an exported JSON file. */
export function parseContent(json: unknown): ContentState {
  const data = json as {
    schemaVersion?: unknown;
    movies?: unknown;
  } | null;
  if (
    data?.schemaVersion !== 1 ||
    !data.movies ||
    typeof data.movies !== 'object'
  ) {
    throw new Error('Formato de arquivo inválido.');
  }
  const content: ContentState = { schemaVersion: 1, movies: {} };
  for (const [id, values] of Object.entries(
    data.movies as Record<string, Record<string, unknown>>
  )) {
    content.movies[id] = validateOverride(values);
  }
  return content;
}
