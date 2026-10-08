'use client';

import {
  grozzeAdmin,
  type AdminUsersListParams,
  type GrozzeRole,
} from '@/shared/api';
import { useAppStore } from '@/shared/store';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

const usersKey = ['grozze', 'admin', 'users'] as const;

export function useAdminUsersQuery(params: AdminUsersListParams) {
  return useQuery({
    queryKey: [...usersKey, 'list', params],
    queryFn: () => grozzeAdmin.users(params),
    placeholderData: keepPreviousData,
    staleTime: 0,
  });
}

export function useAdminUserQuery(id: string | null) {
  return useQuery({
    queryKey: [...usersKey, 'item', id],
    queryFn: () => grozzeAdmin.user(id as string),
    enabled: !!id,
    staleTime: 0,
  });
}

function useInvalidateUsers() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: usersKey });
}

export function useSetUserRoleMutation() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: GrozzeRole }) =>
      grozzeAdmin.setUserRole(id, role),
    onSuccess: (user) => {
      useAppStore
        .getState()
        .toast(
          `${user.name} agora é ${user.role === 'admin' ? 'administrador' : 'usuário'}.`
        );
      return invalidate();
    },
  });
}

export function useRevokeUserSessionsMutation() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (id: string) => grozzeAdmin.revokeUserSessions(id),
    onSuccess: () => {
      useAppStore.getState().toast('Dispositivos desconectados.');
      return invalidate();
    },
  });
}

export function useDeleteUserMutation() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (id: string) => grozzeAdmin.deleteUser(id),
    onSuccess: () => {
      useAppStore.getState().toast('Usuário excluído.');
      return invalidate();
    },
  });
}
