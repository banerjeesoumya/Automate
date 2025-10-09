import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    roleId: z.number().int().positive("Role ID must be a positive integer"),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});