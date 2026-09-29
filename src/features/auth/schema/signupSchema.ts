import { emailField } from '@/shared/lib/validation/emailField';
import { nameField } from '@/shared/lib/validation/nameField';
import { z } from 'zod';

export const signupSchema = z
  .object({
    name: nameField,
    email: emailField,
    password: z
      .string()
      .min(8, 'A senha deve ter pelo menos 8 caracteres.')
      .max(128, 'A senha deve possuir no máximo 128 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirme sua senha.'),
    favoriteGenres: z.array(z.string()),
    marketingConsent: z.boolean(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não coincidem.',
  });

export type SignupValues = z.input<typeof signupSchema>;
