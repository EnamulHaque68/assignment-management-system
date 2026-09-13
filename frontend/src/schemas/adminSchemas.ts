import { z } from 'zod';

export const createUserSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Admin', 'Teacher', 'Student']),
  classId: z.string().optional().nullable(),
}).refine((data) => {
  if (data.role === 'Student' && (!data.classId || data.classId.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: 'Class is required for Student accounts',
  path: ['classId'],
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100),
  classId: z.string().optional().nullable(),
  isActive: z.boolean(),
  password: z.string().optional().nullable().refine(
    (val) => !val || val.length >= 6,
    { message: 'New password must be at least 6 characters' }
  ),
});

export type UpdateUserFormData = z.infer<typeof updateUserSchema>;

export const upsertClassSchema = z.object({
  name: z.string().min(1, 'Class name is required').max(50),
  code: z.string().min(1, 'Class code is required').max(20),
  description: z.string().optional().nullable(),
  isActive: z.boolean(),
});

export type UpsertClassFormData = z.infer<typeof upsertClassSchema>;

export const upsertSubjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required').max(100),
  code: z.string().min(1, 'Subject code is required').max(20),
  description: z.string().optional().nullable(),
  isActive: z.boolean(),
});

export type UpsertSubjectFormData = z.infer<typeof upsertSubjectSchema>;

export const createTeacherAssignmentSchema = z.object({
  teacherId: z.string().min(1, 'Please select a teacher'),
  classId: z.string().min(1, 'Please select a class'),
  subjectId: z.string().min(1, 'Please select a subject'),
});

export type CreateTeacherAssignmentFormData = z.infer<typeof createTeacherAssignmentSchema>;
