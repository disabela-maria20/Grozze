import type { Movie, NewsItem } from '../types';
import { NEWS } from './NEWS';

/** News of the movie's distributor. */
export function relatedNews(movie: Movie): NewsItem[] {
  return NEWS.filter((news) => news.dist === movie.dist);
}
