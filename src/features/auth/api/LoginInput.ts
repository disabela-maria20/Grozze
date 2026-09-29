'use client';

import type { RegisterRequest } from '@/shared/api/types';

export type LoginInput = Pick<RegisterRequest, 'email'> &
  Partial<Pick<RegisterRequest, 'name' | 'marketingConsent'>> & {
    signup?: boolean;
  };
