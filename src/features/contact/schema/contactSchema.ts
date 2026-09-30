import { emailField, nameField } from '@/shared/lib/validation';
import { z } from 'zod';

export function contactSchema(newsletter: boolean) {
  return z.object({
    name: nameField,
    email: emailField,
    message: newsletter
      ? z.string()
      : z
          .string()
          .trim()
          .min(1, 'Escreva sua mensagem.')
          .max(3000, 'Use até 3000 caracteres.'),
    marketingConsent: newsletter
      ? z.boolean().refine(Boolean, 'Autorize o recebimento para se cadastrar.')
      : z.boolean(),
  });
}

export type ContactValues = z.input<ReturnType<typeof contactSchema>>;
