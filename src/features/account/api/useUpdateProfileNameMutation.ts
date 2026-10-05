'use client';

import { grozzeAuth } from '@/shared/api';
import { useAppStore } from '@/shared/store';
import { useMutation } from '@tanstack/react-query';

export function useUpdateProfileNameMutation() {
  return useMutation({
    mutationFn: (name: string) => grozzeAuth.updateMe({ name: name.trim() }),
    onSuccess: (user) => {
      const store = useAppStore.getState();
      store.setAccount(user);
      store.toast('Dados atualizados.');
    },
  });
}
