'use client';

import { request } from '@/shared/api/request';
import type { Preferences } from '@/shared/api/types';
import { useAppStore } from '@/shared/store/useAppStore';
import { useMutation } from '@tanstack/react-query';

export function useUpdatePreferencesMutation() {
  return useMutation({
    mutationFn: (prefs: Preferences) =>
      request(() => useAppStore.getState().updatePreferences(prefs)),
  });
}
