'use client';

import { grozzeAuth, SENSITIVE_MUTATION } from '@/shared/api';
import { useAppStore } from '@/shared/store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const sessionsQueryKey = ['grozze', 'sessions'] as const;

/** Devices logged in to the account, the current one marked. */
export function useSessionsQuery() {
  return useQuery({
    queryKey: sessionsQueryKey,
    queryFn: grozzeAuth.sessions,
    staleTime: 0,
  });
}

/** Logs out one device (by session id), or every other device (`null`). */
export function useRevokeSessionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string | null) =>
      sessionId
        ? grozzeAuth.revokeSession(sessionId)
        : grozzeAuth.revokeOtherSessions(),
    onSuccess: (_result, sessionId) => {
      useAppStore
        .getState()
        .toast(
          sessionId
            ? 'Dispositivo desconectado.'
            : 'Você saiu dos outros dispositivos.'
        );
      return queryClient.invalidateQueries({ queryKey: sessionsQueryKey });
    },
  });
}

export function useChangePasswordMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    ...SENSITIVE_MUTATION,
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => grozzeAuth.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      useAppStore
        .getState()
        .toast('Senha alterada. Os outros dispositivos foram desconectados.');
      return queryClient.invalidateQueries({ queryKey: sessionsQueryKey });
    },
  });
}
