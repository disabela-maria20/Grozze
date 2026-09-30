'use client';

import { request } from '@/shared/api';
import { useAppStore } from '@/shared/store';
import { useMutation } from '@tanstack/react-query';

const MAX_IMPORT_BYTES = 2_000_000;

export function useImportContentMutation() {
  return useMutation({
    mutationFn: async (file: File) => {
      if (file.size > MAX_IMPORT_BYTES)
        throw new Error('Arquivo muito grande.');
      const data: unknown = JSON.parse(await file.text());
      return request(() => useAppStore.getState().importContent(data));
    },
  });
}
