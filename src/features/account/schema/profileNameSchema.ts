import { nameField } from '@/shared/lib/validation';
import { z } from 'zod';

export const profileNameSchema = z.object({ name: nameField });

export type ProfileNameValues = z.input<typeof profileNameSchema>;
