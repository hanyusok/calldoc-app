'use server';

import { z } from 'zod';
import { prisma } from '@/app/lib/prisma';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { hashPassword, validateUserUniqueness } from '@/app/lib/user-service';

const RegisterSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export async function registerUser(prevState: unknown, formData: FormData) {
    const validatedFields = RegisterSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Register.',
        };
    }

    const { name, email, password } = validatedFields.data;

    try {
        await validateUserUniqueness(email);

        const hashedPassword = await hashPassword(password);

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                // Default values for required fields in your schema (if any remaining) which are not in the form
                // Based on schema, other fields are optional or have defaults, except maybe:
                // age, gender, phoneNumber, residentNumber are optional?
                // Let's check schema again. schema says:
                // age Int?
                // gender String?
                // phoneNumber String?
                // residentNumber String?
                // So they are optional.
            },
        });

        // We can't sign in directly here in a server action easily without redirecting, 
        // but usually we redirect to login or auto-login.
        // For now, let's just return success.

    } catch (error) {
        console.error('Registration error:', error);
        return {
            message: 'Database Error: Failed to Create User.',
        };
    }

    // Attempt to sign in immediately after registration?
    // Or just redirect to login page.
    // Let's redirect to login for simplicity initially, or return success status.
    return { success: true };
}

export async function authenticate(
    locale: string,
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', { ...Object.fromEntries(formData), redirectTo: `/${locale}/auth/callback` });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}
