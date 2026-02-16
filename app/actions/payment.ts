"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

import { createMeeting } from "./meet";
import { createNotification } from "./notification";
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
            include: {
                appointment: {
                    include: {
                        user: true,
                        doctor: true
                    }
                }
            }
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

        // 4. Create Google Meet
        let meetingLink = null;
        try {
            if (!payment.appointment.meetingLink) {
                // Calculate start time (assuming 30 min from now or appointment time)
                // For now, use appointment date + 30 min
                const start = payment.appointment.date;
                const end = new Date(start.getTime() + 30 * 60000);

                // Use createMeeting directly to get the link string without side effect saving
                meetingLink = await createMeeting({
                    appointmentId: payment.appointmentId,
                    startDateTime: start,
                    endDateTime: end,
                    patientName: payment.appointment.user.name || 'Patient'
                });
            } else {
                meetingLink = payment.appointment.meetingLink;
            }
        } catch (e) {
            console.error("Meet creation failed", e);
        }

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
                    // Save meeting link atomically with confirmation
                    ...(meetingLink ? { meetingLink } : {})
                }
            })
        ]);

        console.log(`Payment ${orderId} successfully confirmed.`);

        // 6. Notify Admins & Patient
        try {
            // Notify Patient
            await createNotification({
                userId: payment.appointment.userId,
                type: 'APPOINTMENT_CONFIRMED',
                message: `Payment successful. Your consultation with ${payment.appointment.doctor.name} is confirmed.`,
                key: 'Notifications.payment_confirmed',
                params: { doctor: payment.appointment.doctor.name },
                link: `/myappointment`
            });

            // Notify Doctor (if user attached) or Admin
            // For now, finding admins
            const admins = await prisma.user.findMany({
                where: { role: 'ADMIN' }
            });

            if (admins.length > 0) {
                await prisma.notification.createMany({
                    data: admins.map(admin => ({
                        userId: admin.id,
                        type: 'PAYMENT_CONFIRMED',
                        message: `Payment confirmed for ${payment.appointment.user.name || 'Patient'}. Doctor: ${payment.appointment.doctor.name}`,
                        link: `/admin/dashboard/payments?highlight=${orderId}`,
                    }))
                });
            }

        } catch (e) {
            console.error("Notification failed", e);
        }

        // 7. Revalidate Paths
        revalidatePath('/dashboard');
        revalidatePath('/myappointment');
        revalidatePath('/[locale]/myappointment');
        revalidatePath('/ko/myappointment'); // Explicitly needed sometimes
        revalidatePath('/en/myappointment');
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
            appointment: {
                include: { user: true }
            }
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

    // Notify the Patient User
    try {
        if (payment.appointment.userId) {
            await createNotification({
                userId: payment.appointment.userId,
                type: 'PAYMENT_CANCELLED',
                message: `Your payment has been cancelled and refunded.`,
                key: 'Notifications.payment_cancelled',
                link: `/myappointment`
            });
        }
    } catch (e) {
        console.error("Cancellation notification failed", e);
    }

    revalidatePath('/dashboard');
    revalidatePath('/myappointment');
    revalidatePath('/[locale]/myappointment');
    revalidatePath('/admin/dashboard');

    return { success: true };
}

export async function cancelPayment(paymentId: string, reason: string) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
        return { success: false, error: "Unauthorized" }
    }

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
