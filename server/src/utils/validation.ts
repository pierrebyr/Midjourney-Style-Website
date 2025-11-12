import { z } from 'zod';

/**
 * Validation schemas using Zod for runtime validation
 */

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createStyleSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title too long'),
  sref: z.string().min(1, 'Sref is required'),
  images: z.array(z.string()).min(1, 'At least one image required').max(4, 'Maximum 4 images'),
  mainImageIndex: z.number().int().min(0).default(0),
  description: z.string().max(1000, 'Description too long').optional(),
  tags: z.array(z.string().max(30, 'Tag too long')).default([]),
  params: z.object({
    sref: z.string().optional(),
    model: z.string().optional(),
    seed: z.number().optional(),
    ar: z.string().optional(),
    chaos: z.number().optional(),
    stylize: z.number().optional(),
    weird: z.number().optional(),
    tile: z.boolean().optional(),
    version: z.union([z.number(), z.string()]).optional(),
    raw: z.string().optional(),
  }),
});

export const createCollectionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
});

export const createCommentSchema = z.object({
  text: z.string().min(1, 'Comment cannot be empty').max(500, 'Comment too long'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
});
