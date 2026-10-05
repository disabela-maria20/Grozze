'use client';

import type { ReactNode } from 'react';

/** Narrow centered card used by the login, sign-up and password pages. */
export function AuthCardPage({ children }: { children: ReactNode }) {
  return (
    <div className="page pt-[120px] max-sm:pt-[101px] pb-13 min-h-[65vh]">
      <div className="w-[min(1220px,530px)] max-sm:w-[calc(100%-32px)] mx-auto">
        <div className="p-6 max-sm:p-4.5 border border-line bg-surface rounded-app">
          {children}
        </div>
      </div>
    </div>
  );
}
