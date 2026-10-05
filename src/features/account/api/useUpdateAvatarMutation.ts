'use client';

import {
  AVATAR_KEY_BY_NAME,
  ensureGrozzeList,
  grozzeAuth,
  type Profile,
} from '@/shared/api';
import { useAppStore } from '@/shared/store';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateAvatarMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (avatar: Profile['avatar']) => {
      const avatars = await ensureGrozzeList(queryClient, 'avatars');
      const option = avatars.find(
        (candidate) => AVATAR_KEY_BY_NAME[candidate.nome] === avatar
      );
      return grozzeAuth.updateMe({ avatarId: option?.id ?? null });
    },
    onSuccess: (user) => useAppStore.getState().setAccount(user),
  });
}
