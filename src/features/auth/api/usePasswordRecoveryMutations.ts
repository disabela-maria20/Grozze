'use client';

import { grozzeAuth } from '@/shared/api';
import { useMutation } from '@tanstack/react-query';

/** Sends the reset link. Same answer whether the e-mail has an account or not. */
export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (email: string) => grozzeAuth.forgotPassword(email),
  });
}

/** Sets the new password with the e-mail's token; every session is logged out. */
export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      grozzeAuth.resetPassword(token, password),
  });
}
