import newsJson from '@/data/news.json';
import type { NewsItem } from './types';
import type { Movie } from '@/entities/movie';

export const NEWS = newsJson as NewsItem[];

/** News of the movie's distributor. */
export function relatedNews(movie: Movie): NewsItem[] {
  return NEWS.filter((news) => news.dist === movie.dist);
}
