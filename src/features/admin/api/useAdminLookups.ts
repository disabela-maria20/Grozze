'use client';

import {
  grozzeAdmin,
  type GrozzeLookup,
  type GrozzeLookupInput,
} from '@/shared/api';
import { useAppStore } from '@/shared/store';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/** Admin lookup path → key of the public list query (`useGrozzeListQuery`). */
const PUBLIC_LIST_KEY: Record<GrozzeLookup, string> = {
  avatars: 'avatars',
  languages: 'languages',
  experiences: 'experiences',
  'movie-genres': 'movieGenres',
};

/** Refetches the public list so new/edited options show up everywhere. */
function useInvalidateList() {
  const queryClient = useQueryClient();
  return (lookup: GrozzeLookup) =>
    queryClient.invalidateQueries({
      queryKey: ['grozze', PUBLIC_LIST_KEY[lookup]],
    });
}

export interface LookupMutationInput {
  lookup: GrozzeLookup;
  body: GrozzeLookupInput;
}

export function useCreateLookupMutation() {
  const invalidate = useInvalidateList();
  return useMutation({
    mutationFn: ({ lookup, body }: LookupMutationInput) =>
      grozzeAdmin.createLookup(lookup, body),
    onSuccess: (_result, { lookup }) => {
      useAppStore.getState().toast('Item adicionado.');
      return invalidate(lookup);
    },
  });
}

export function useUpdateLookupMutation() {
  const invalidate = useInvalidateList();
  return useMutation({
    mutationFn: ({ lookup, id, body }: LookupMutationInput & { id: number }) =>
      grozzeAdmin.updateLookup(lookup, id, body),
    onSuccess: (_result, { lookup }) => {
      useAppStore.getState().toast('Item salvo.');
      return invalidate(lookup);
    },
  });
}

export function useDeleteLookupMutation() {
  const invalidate = useInvalidateList();
  return useMutation({
    mutationFn: ({ lookup, id }: { lookup: GrozzeLookup; id: number }) =>
      grozzeAdmin.deleteLookup(lookup, id),
    onSuccess: (_result, { lookup }) => {
      useAppStore.getState().toast('Item excluído.');
      return invalidate(lookup);
    },
  });
}
