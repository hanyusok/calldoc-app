"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

// NOTE: These modules are not yet implemented in the current codebase.
// import { createMeeting } from "./meet";
// import { createNotification } from "@/app/lib/notifications";
// import { getTranslations } from "next-intl/server";

export async function initiatePayment(appointmentId: string) {
    // 1. Fetch Appointment to get price and user details
    const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
            user: true, // Patient details
            doctor: true
        }
    });

    if (!appointment) return { success: false, error: "Appointment not found" };
    if (!appointment.price) return { success: false, error: "Price not set" };

    // 2. Check if Payment already exists
    let payment = await prisma.payment.findUnique({
        where: { appointmentId: appointmentId }
    });

    if (!payment) {
        // Create new Payment record
        payment = await prisma.payment.create({
            data: {
                appointmentId: appointmentId,
                amount: Math.round(appointment.price), // Ensure integer
                status: 'PENDING',
                method: 'KIWOOM' // Default initial method
            }
        });
    } else {
        // Update existing if needed (e.g. if price changed? For now assume fixed)
        // Check if already paid
        if (payment.status === 'COMPLETED') {
            return { success: false, error: "Payment already completed" };
        }
    }

    return {
        success: true,
        paymentId: payment.id,
        amount: payment.amount,
        customerName: appointment.user.name || "Guest",
        customerEmail: appointment.user.email,
        productName: `Medical Consultation: ${appointment.doctor.name}`
    };
}

export async function confirmPayment(paymentKey: string, orderId: string, amount: number) {
    console.log("Processing Kiwoom payment:", { orderId, amount, paymentKey });

    try {
        // 1. Fetch Payment and Appointment details
        const payment = await prisma.payment.findUnique({
            where: { id: orderId },
            include: { appointment: true }
        });

        if (!payment) return { success: false, error: "Payment record not found" };

        // 2. Idempotency Check
        if (payment.status === 'COMPLETED') {
            console.log(`Payment ${orderId} already completed.`);
            return { success: true, message: "Already completed" };
        }

        // 3. Verify Amount
        if (payment.amount !== amount) {
            console.warn(`Payment amount mismatch for ${orderId}: expected ${payment.amount}, got ${amount}`);
            // Note: We currently log the warning but proceed. 
        }

        // 4. Create Google Meet (Placeholder)
        /*
        let meetingLink = null;
        try {
            if (!payment.appointment.meetingLink) {
                 // meetingLink = await createMeeting(...);
            }
        } catch (e) {
            console.error("Meet creation failed", e);
        }
        */

        // 5. Update Database Transaction
        await prisma.$transaction([
            prisma.payment.update({
                where: { id: orderId },
                data: {
                    status: 'COMPLETED',
                    approvedAt: new Date(),
                    method: 'KIWOOM',
                    paymentKey: paymentKey // Save the Transaction ID (DAOUTRX)
                }
            }),
            prisma.appointment.update({
                where: { id: payment.appointmentId },
                data: {
                    status: 'CONFIRMED',
                    // ...(meetingLink ? { meetingLink } : {})
                }
            })
        ]);

        console.log(`Payment ${orderId} successfully confirmed.`);

        // 6. Notify Admins & Patient (Placeholder)
        /*
        // ... notification logic
        */

        // 7. Revalidate Paths
        revalidatePath('/dashboard');
        revalidatePath('/admin/dashboard');

        return { success: true };

    } catch (err) {
        console.error("confirmPayment Error:", err);
        return { success: false, error: "Internal Server Error" };
    }
}

// Helper for consistent cancellation processing (used by Action and Callback)
export async function processCancellationSuccess(paymentId: string, paymentKey?: string) {
    console.log(`Processing cancellation success for payment ${paymentId}`);

    // Fetch payment to get appointmentId
    const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
            appointment: true
        }
    });

    if (!payment) {
        throw new Error(`Payment ${paymentId} not found during cancellation processing`);
    }

    await prisma.$transaction([
        prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: 'CANCELLED', // Note: Using CANCELLED to match typical status
                ...(paymentKey ? { paymentKey } : {})
            }
        }),
        prisma.appointment.update({
            where: { id: payment.appointmentId },
            data: { status: 'CANCELLED' }
        })
    ]);

    // Notify the Patient User (Placeholder)
    /*
    if (payment.appointment.userId) {
         // await createNotification(...)
    }
    */

    revalidatePath('/dashboard');
    revalidatePath('/admin/dashboard');

    return { success: true };
}

export async function cancelPayment(paymentId: string, reason: string) {
    // TODO: Verify user is admin using your auth implementation
    /*
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
        return { success: false, error: "Unauthorized" }
    }
    */

    const payment = await prisma.payment.findUnique({
        where: { id: paymentId }
    })

    if (!payment) {
        return { success: false, error: "Payment not found" }
    }

    // Kiwoom Pay Cancellation Logic
    const KIWOOM_MID = process.env.NEXT_PUBLIC_KIWOOM_MID;
    const AUTH_KEY = process.env.KIWOOM_AUTH_KEY; // Secret Key

    if (!payment.paymentKey) {
        return { success: false, error: "NO_PAYMENT_KEY" }
    }

    // Bypass Kiwoom API for simulated test transactions
    if (payment.paymentKey.startsWith("TX_SIM_")) {
        console.log("Simulated payment cancellation - bypassing gateway");
        await processCancellationSuccess(paymentId, payment.paymentKey);
        return { success: true };
    }

    try {
        const payload = {
            CPID: KIWOOM_MID,
            PAYMETHOD: "CARD", // Assuming Card for now, in real app might need dynamic method
            AMOUNT: payment.amount.toString(),
            CANCELREQ: "Y",
            TRXID: payment.paymentKey,
            CANCELREASON: reason,
            TAXFREEAMT: "0"
        };

        const iconv = require('iconv-lite');
        // Encode payload to EUC-KR for both requests
        const eucKrPayload = iconv.encode(JSON.stringify(payload), 'euc-kr');

        // Step 1: Ready Request
        const readyUrl = "https://apitest.kiwoompay.co.kr/pay/ready";
        console.log("Kiwoom Cancel Ready Payload (JSON):", JSON.stringify(payload));

        const readyRes = await fetch(readyUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=EUC-KR",
                "Authorization": AUTH_KEY || ""
            },
            body: eucKrPayload
        });

        if (!readyRes.ok) {
            throw new Error(`Kiwoom Ready API Failed: ${readyRes.status}`);
        }

        const readyData = await readyRes.json();
        console.log("Kiwoom Ready Response:", readyData);
        const { TOKEN, RETURNURL } = readyData;

        if (!TOKEN || !RETURNURL) {
            console.error("Kiwoom Cancel Ready Failed", readyData);
            return { success: false, error: "Failed to initialize cancellation" };
        }

        // Step 2: Final Request
        console.log("Kiwoom Cancel Final Request to:", RETURNURL);

        const finalRes = await fetch(RETURNURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=EUC-KR",
                "Authorization": AUTH_KEY || "",
                "TOKEN": TOKEN
            },
            body: eucKrPayload
        });

        if (!finalRes.ok) {
            throw new Error(`Kiwoom Final API Failed: ${finalRes.status}`);
        }

        const finalData = await finalRes.json();
        console.log("Kiwoom Cancel Result:", finalData);

        // Check RESULTCODE
        if (finalData.RESULTCODE === "0000") {
            // Success - Use shared helper
            await processCancellationSuccess(paymentId);
            return { success: true }
        } else {
            return { success: false, error: finalData.ERRORMESSAGE || "Cancellation Failed" }
        }

    } catch (error: any) {
        console.error("Cancel Payment Error:", error);
        return { success: false, error: "Internal Server Error" };
    }
}
