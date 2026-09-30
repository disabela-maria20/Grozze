import { emailField } from '@/shared/lib/validation';
import { z } from 'zod';

export const loginSchema = z.object({
  email: emailField,
  password: z
    .string()
    .min(1, 'Informe sua senha.')
    .max(128, 'A senha deve possuir no máximo 128 caracteres.'),
});

export type LoginValues = z.input<typeof loginSchema>;
