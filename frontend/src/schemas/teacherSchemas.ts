import { z } from 'zod';

export const createAssignmentSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(120, 'Title cannot exceed 120 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long'),
  classId: z.string().min(1, 'Please select a target class'),
  subjectId: z.string().min(1, 'Please select an academic subject'),
  deadline: z.string().min(1, 'Please specify a deadline date and time'),
  maximumMarks: z
    .number()
    .int('Marks must be a whole number')
    .min(1, 'Maximum marks must be at least 1')
    .max(1000, 'Maximum marks cannot exceed 1000'),
  publishNow: z.boolean(),
});

export type CreateAssignmentFormData = z.infer<typeof createAssignmentSchema>;

export const updateAssignmentSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(120, 'Title cannot exceed 120 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long'),
  classId: z.string().min(1, 'Please select a target class'),
  subjectId: z.string().min(1, 'Please select an academic subject'),
  deadline: z.string().min(1, 'Please specify a deadline date and time'),
  maximumMarks: z
    .number()
    .int('Marks must be a whole number')
    .min(1, 'Maximum marks must be at least 1')
    .max(1000, 'Maximum marks cannot exceed 1000'),
});

export type UpdateAssignmentFormData = z.infer<typeof updateAssignmentSchema>;

export const reviewSubmissionSchema = z.object({
  marks: z
    .number()
    .int('Marks must be a whole number')
    .min(0, 'Marks cannot be negative'),
  feedback: z.string().optional().nullable(),
  status: z.enum(['Reviewed', 'Rejected']),
});

export type ReviewSubmissionFormData = z.infer<typeof reviewSubmissionSchema>;
