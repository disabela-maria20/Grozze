import type { Movie } from '../types';
import { status } from './status';

export const statusLabel = (m: Movie | null | undefined): string =>
  ({ now: 'Em cartaz', presale: 'Pré-venda', soon: 'Em breve' })[status(m)];
