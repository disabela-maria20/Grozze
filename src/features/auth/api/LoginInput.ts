'use client';

import type { RegisterRequest } from '@/shared/api/types';

export type LoginInput = Pick<RegisterRequest, 'email' | 'password'> &
  Partial<
    Pick<RegisterRequest, 'name' | 'marketingConsent' | 'favoriteGenres'>
  > & {
    signup?: boolean;
  };
