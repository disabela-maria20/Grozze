import type { Movie, NewsItem } from '../types';
import { NEWS } from './NEWS';

export function relatedNews(m: Movie): NewsItem[] {
  return NEWS.filter((n) => n.dist === m.dist);
}
