'use client';

export interface PendingFavorite {
  kind: 'movie' | 'cinema';
  id: string;
  path: string;
  scrollY: number;
}
