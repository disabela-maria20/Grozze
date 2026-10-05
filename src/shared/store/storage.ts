import type { PersistStorage } from 'zustand/middleware';
import { safeStorage } from './safeStorage';

export const storage = safeStorage('localStorage');

/**
 * Zustand `persist` on top of `safeStorage`, so private mode or disabled
 * storage falls back to memory instead of throwing.
 */
export function persistStorage<T>(): PersistStorage<T> {
  return {
    getItem: (name) => storage.read(name, null),
    setItem: (name, value) => storage.write(name, value),
    removeItem: (name) => storage.remove(name),
  };
}
