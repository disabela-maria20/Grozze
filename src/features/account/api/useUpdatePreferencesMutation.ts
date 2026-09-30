'use client';

import { request, type Preferences } from '@/shared/api';
import { useAppStore } from '@/shared/store';
import { useMutation } from '@tanstack/react-query';

export function useUpdatePreferencesMutation() {
  return useMutation({
    mutationFn: (prefs: Preferences) =>
      request(() => useAppStore.getState().updatePreferences(prefs)),
  });
}
