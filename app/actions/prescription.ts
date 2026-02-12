"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

// Patient requests a prescription transfer
export async function requestPrescription(
    appointmentId: string,
    pharmacyDetails: {
        name: string;
        fax?: string;
        phone?: string;
        address?: string;
    }
) {
    // TODO: Auth check (Session)
    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { user: true }
        });

        if (!appointment) return { error: "Appointment not found" };

        // Upsert prescription request
        await prisma.prescription.upsert({
            where: { appointmentId },
            update: {
                pharmacyName: pharmacyDetails.name,
                pharmacyFax: pharmacyDetails.fax,
                pharmacyPhone: pharmacyDetails.phone,
                pharmacyAddress: pharmacyDetails.address,
                status: 'REQUESTED'
            },
            create: {
                appointmentId,
                pharmacyName: pharmacyDetails.name,
                pharmacyFax: pharmacyDetails.fax,
                pharmacyPhone: pharmacyDetails.phone,
                pharmacyAddress: pharmacyDetails.address,
                status: 'REQUESTED'
            }
        });

        revalidatePath(`/dashboard`);
        revalidatePath(`/admin/appointments`);
        return { success: true };
    } catch (error) {
        console.error("Failed to request prescription", error);
        return { error: "Failed to request prescription" };
    }
}

// Admin/Doctor issues the prescription (e.g. by providing a file URL)
export async function issuePrescription(
    prescriptionId: string,
    fileUrl: string
) {
    try {
        const updatedPrescription = await prisma.prescription.update({
            where: { id: prescriptionId },
            data: {
                status: 'ISSUED',
                fileUrl
            }
        });

        revalidatePath('/admin/appointments');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Failed to issue prescription", error);
        return { error: "Failed to issue prescription" };
    }
}
