import { z } from 'zod';

export const submitAnswerSchema = z.object({
  answer: z
    .string()
    .min(5, 'Your answer must be at least 5 characters long')
    .max(10000, 'Your answer cannot exceed 10,000 characters'),
});

export type SubmitAnswerFormData = z.infer<typeof submitAnswerSchema>;
