'use server';

import { auth, signOut } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/app/actions/notification";
import { z } from "zod";

const phoneRegex = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;

const ProfileSchema = z.object({
    age: z.number().nullable(),
    gender: z.string().nullable(),
    phoneNumber: z.string().regex(phoneRegex).nullable(),
    residentNumber: z.string().nullable(),
});

const FamilyMemberSchema = z.object({
    name: z.string().min(1),
    relation: z.string(),
    age: z.number(),
    gender: z.string(),
    residentNumber: z.string().optional().nullable(),
    phoneNumber: z.string().regex(phoneRegex).optional().nullable().or(z.literal('')),
});

// Helper to robustly get the current user from DB based on session email
async function getAuthenticatedUser() {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) throw new Error("User not found");
    return user;
}

export async function updateProfile(data: any) {
    const user = await getAuthenticatedUser();
    const validated = ProfileSchema.parse(data);

    await prisma.user.update({
        where: { id: user.id },
        data: validated,
    });
    revalidatePath('/profile');
}

export async function updateName(name: string) {
    const user = await getAuthenticatedUser();

    await prisma.user.update({
        where: { id: user.id },
        data: { name },
    });
    revalidatePath('/profile');
}

export async function updateInsurance(data: any) {
    const user = await getAuthenticatedUser();

    await prisma.insurance.upsert({
        where: { userId: user.id },
        update: {
            provider: data.provider,
            policyNumber: data.policyNumber,
        },
        create: {
            userId: user.id,
            provider: data.provider,
            policyNumber: data.policyNumber,
        },
    });
    revalidatePath('/profile');
}

export async function deleteInsurance() {
    const user = await getAuthenticatedUser();

    try {
        await prisma.insurance.delete({
            where: { userId: user.id },
        });
        revalidatePath('/profile');
    } catch (error) {
        // Ignore if not found
    }
}

export async function addFamilyMember(data: any) {
    const user = await getAuthenticatedUser();
    const validated = FamilyMemberSchema.parse(data);

    await prisma.familyMember.create({
        data: {
            userId: user.id,
            ...validated
        },
    });
    revalidatePath('/profile');
}

export async function removeFamilyMember(id: string) {
    const user = await getAuthenticatedUser();

    const member = await prisma.familyMember.findUnique({
        where: { id },
    });

    if (member?.userId === user.id) {
        await prisma.familyMember.delete({
            where: { id },
        });
        revalidatePath('/profile');
    }
}

export async function updateFamilyMember(data: any) {
    const user = await getAuthenticatedUser();
    const validated = FamilyMemberSchema.parse(data);

    const member = await prisma.familyMember.findUnique({
        where: { id: data.id },
    });

    if (member?.userId === user.id) {
        await prisma.familyMember.update({
            where: { id: data.id },
            data: validated,
        });
        revalidatePath('/profile');
    }
}

export async function logout() {
    await signOut();
}

export async function updatePharmacy(pharmacyId: string) {
    const user = await getAuthenticatedUser();

    const pharmacy = await prisma.pharmacy.findUnique({
        where: { id: pharmacyId },
    });

    if (!pharmacy) {
        throw new Error("Pharmacy not found");
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { pharmacyId },
    });

    await createNotification({
        userId: user.id,
        type: 'PHARMACY_UPDATED',
        message: `Pharmacy has been updated to ${pharmacy.name}`,
        key: 'Notifications.pharmacy_updated',
        params: { name: pharmacy.name }
    });

    revalidatePath('/profile');
}
