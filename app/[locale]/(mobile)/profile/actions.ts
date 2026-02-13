'use server';

import { auth, signOut } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

// Helper to robustly get the current user from DB based on session email
// This handles cases where the DB was reset but the browser session (cookie) still holds an old User ID.
async function getAuthenticatedUser() {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    // Always fetch latest user by email to ensure we have the correct ID
    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) throw new Error("User not found");
    return user;
}

export async function updateProfile(data: any) {
    const user = await getAuthenticatedUser();

    await prisma.user.update({
        where: { id: user.id },
        data: {
            age: data.age,
            gender: data.gender,
            phoneNumber: data.phoneNumber,
            residentNumber: data.residentNumber,
        },
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

    await prisma.familyMember.create({
        data: {
            userId: user.id,
            name: data.name,
            relation: data.relation,
            age: data.age,
            gender: data.gender,
            residentNumber: data.residentNumber,
            phoneNumber: data.phoneNumber,
        },
    });
    revalidatePath('/profile');
}

export async function removeFamilyMember(id: string) {
    const user = await getAuthenticatedUser();

    // Ensure the family member belongs to the user
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

export async function logout() {
    await signOut();
}

export async function updatePharmacy(pharmacyId: string) {
    const user = await getAuthenticatedUser();

    // Verify pharmacy exists
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

    revalidatePath('/profile');
}
