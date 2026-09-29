import { emailField } from '@/shared/lib/validation/emailField';
import { nameField } from '@/shared/lib/validation/nameField';
import { z } from 'zod';

export const signupSchema = z.object({
  name: nameField,
  email: emailField,
  marketingConsent: z.boolean(),
});

export type SignupValues = z.input<typeof signupSchema>;
