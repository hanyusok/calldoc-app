'use server';

import { auth, signOut } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: any) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.user.update({
        where: { id: session.user.id },
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
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.user.update({
        where: { id: session.user.id },
        data: { name },
    });
    revalidatePath('/profile');
}

export async function updateInsurance(data: any) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.insurance.upsert({
        where: { userId: session.user.id },
        update: {
            provider: data.provider,
            policyNumber: data.policyNumber,
        },
        create: {
            userId: session.user.id,
            provider: data.provider,
            policyNumber: data.policyNumber,
        },
    });
    revalidatePath('/profile');
}

export async function deleteInsurance() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    try {
        await prisma.insurance.delete({
            where: { userId: session.user.id },
        });
        revalidatePath('/profile');
    } catch (error) {
        // Ignore if not found
    }
}

export async function addFamilyMember(data: any) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.familyMember.create({
        data: {
            userId: session.user.id,
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
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Ensure the family member belongs to the user
    const member = await prisma.familyMember.findUnique({
        where: { id },
    });

    if (member?.userId === session.user.id) {
        await prisma.familyMember.delete({
            where: { id },
        });
        revalidatePath('/profile');
    }
}

export async function logout() {
    await signOut();
}
