import {
  emailField,
  nameField,
  newPasswordField,
} from '@/shared/lib/validation';
import { z } from 'zod';

export const signupSchema = z
  .object({
    name: nameField,
    email: emailField,
    password: newPasswordField,
    confirmPassword: z.string().min(1, 'Confirme sua senha.'),
    favoriteGenres: z.array(z.string()),
    marketingConsent: z.boolean(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não coincidem.',
  });

export type SignupValues = z.input<typeof signupSchema>;
