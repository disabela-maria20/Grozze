import { emailField, newPasswordField } from '@/shared/lib/validation';
import { z } from 'zod';

export const forgotPasswordSchema = z.object({ email: emailField });

export type ForgotPasswordValues = z.input<typeof forgotPasswordSchema>;

/** New password typed twice: used to reset it and to change it. */
export const newPasswordSchema = z
  .object({
    password: newPasswordField,
    confirmPassword: z.string().min(1, 'Confirme sua senha.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não coincidem.',
  });

export type NewPasswordValues = z.input<typeof newPasswordSchema>;
