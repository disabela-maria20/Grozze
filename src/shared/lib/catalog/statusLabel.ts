import type { Movie, MovieStatus } from '../types';
import { status } from './status';

const STATUS_LABELS: Record<MovieStatus, string> = {
  now: 'Em cartaz',
  presale: 'Pré-venda',
  soon: 'Em breve',
};

export const statusLabel = (movie: Movie | null | undefined): string =>
  STATUS_LABELS[status(movie)];
