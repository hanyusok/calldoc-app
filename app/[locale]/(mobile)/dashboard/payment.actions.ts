'use server';

import crypto from 'crypto';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@/auth';

// KiwoomPay Keys
const MERCHANT_ID = process.env.NEXT_PUBLIC_KIWOOM_MID!;
const SECRET_KEY = process.env.KIWOOM_AUTH_KEY!;

export async function getPaymentLink(appointmentId: string) {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { doctor: true }
    });

    if (!appointment) throw new Error("Appointment not found");
    if (appointment.price === null) throw new Error("Price not set");

    // 1. Generate Order Number
    const orderNo = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const amount = appointment.price.toString();
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // 2. Get Payment Signature
    const { getKiwoomHash } = await import("@/app/lib/kiwoom");

    const hashResult = await getKiwoomHash({
        CPID: MERCHANT_ID,
        ORDERNO: orderNo,
        AMOUNT: amount,
        PAYMETHOD: 'CARD', // Changed from TOTAL
        TYPE: 'P',        // Changed from M
    });

    if (!hashResult.success || !hashResult.KIWOOM_ENC) {
        throw new Error(hashResult.error || "Failed to generate payment signature");
    }

    const hash = hashResult.KIWOOM_ENC;

    // 3. Construct URL
    const baseUrl = process.env.NEXT_PUBLIC_KIWOOM_PAY_ACTION_URL!;
    const queryParams = new URLSearchParams({
        CPID: MERCHANT_ID,
        ORDERNO: orderNo,
        AMOUNT: amount,
        PRODUCT_NM: `Consultation: ${appointment.doctor.name}`,
        BUYER_NM: session.user.name || "Guest",
        BUYER_EMAIL: session.user.email || "",
        TIMESTAMP: timestamp,
        SIGNATURE: hash,
        PAYMETHOD: 'CARD', // Must match the hash param
        TYPE: 'P',         // Must match the hash param
        // Using localhost for callback/return URLs for this demo
        RETURN_URL: `http://localhost:3000/api/payment/callback`
    });

    return `${baseUrl}?${queryParams.toString()}`;
}
