import { emailField } from '@/shared/lib/validation/emailField';
import { z } from 'zod';

export const loginSchema = z.object({ email: emailField });

export type LoginValues = z.input<typeof loginSchema>;
