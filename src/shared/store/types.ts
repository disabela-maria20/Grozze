export interface DialogState {
  id: string;
  props?: Record<string, unknown>;
}

export interface PendingFavorite {
  kind: 'movie' | 'cinema';
  id: string;
  path: string;
  scrollY: number;
}
