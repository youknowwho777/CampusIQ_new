import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const studentRegisterSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    rollNumber: z.string().min(2, 'Roll number is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const createTeacherSchema = z.object({
  name: z.string().min(2, 'Teacher name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const createStudentSchema = z.object({
  name: z.string().min(2, 'Student name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  rollNumber: z.string().min(2, 'Roll number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'PENDING', 'REJECTED', 'INACTIVE']),
});
