'use client';

import { useState, type ReactNode } from 'react';
import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { useAppStore } from '@/shared/store/useAppStore';

function createQueryClient() {
  return new QueryClient({
    // Every failed mutation surfaces its message in the global toast
    mutationCache: new MutationCache({
      onError: (err) =>
        useAppStore
          .getState()
          .toast(err instanceof Error ? err.message : 'Algo deu errado.'),
    }),
    defaultOptions: {
      queries: { staleTime: 60_000, retry: 1 },
      mutations: { retry: 0 },
    },
  });
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(createQueryClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
