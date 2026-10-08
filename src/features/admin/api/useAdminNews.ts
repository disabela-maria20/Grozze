'use client';

import {
  grozzeNews,
  type AdminNewsListParams,
  type GrozzeNewsInput,
} from '@/shared/api';
import { useAppStore } from '@/shared/store';
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';

const adminNewsKey = ['grozze', 'admin', 'news'] as const;

/** Admin news list (drafts, scheduled and published), with filters. */
export function useAdminNewsListQuery(params: AdminNewsListParams) {
  return useQuery({
    queryKey: [...adminNewsKey, 'list', params],
    queryFn: () => grozzeNews.listAll(params),
    placeholderData: keepPreviousData,
    staleTime: 0,
  });
}

/** One article for the editor (by id). */
export function useAdminNewsQuery(id: string | null) {
  return useQuery({
    queryKey: [...adminNewsKey, 'item', id],
    queryFn: () => grozzeNews.get(id as string),
    enabled: !!id,
    staleTime: 0,
  });
}

/** Drops every cached news query, admin and public, after a change. */
function useInvalidateNews() {
  const queryClient = useQueryClient();
  return () =>
    queryClient
      .invalidateQueries({ queryKey: ['grozze', 'news'] })
      .then(() => queryClient.invalidateQueries({ queryKey: adminNewsKey }));
}

export function useCreateNewsMutation() {
  const invalidate = useInvalidateNews();
  return useMutation({
    mutationFn: (body: GrozzeNewsInput) => grozzeNews.create(body),
    onSuccess: (article) => {
      useAppStore.getState().toast(`Notícia "${article.title}" criada.`);
      return invalidate();
    },
  });
}

export function useUpdateNewsMutation() {
  const invalidate = useInvalidateNews();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: GrozzeNewsInput }) =>
      grozzeNews.update(id, body),
    onSuccess: (article) => {
      useAppStore.getState().toast(`Notícia "${article.title}" salva.`);
      return invalidate();
    },
  });
}

export function useDeleteNewsMutation() {
  const invalidate = useInvalidateNews();
  return useMutation({
    mutationFn: (id: string) => grozzeNews.remove(id),
    onSuccess: () => {
      useAppStore.getState().toast('Notícia excluída.');
      return invalidate();
    },
  });
}
