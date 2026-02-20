import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
}

export async function validateUserUniqueness(email: string) {
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw new Error("User with this email already exists");
    }
}
