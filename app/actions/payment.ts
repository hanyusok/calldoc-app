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
export async function processCancellationSuccess(paymentId: string, paymentKey?: string, cancelAmount?: number) {
    console.log(`Processing cancellation success for payment ${paymentId}, amount: ${cancelAmount}`);

    // Fetch payment to get details
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

    const currentRefunded = payment.refundedAmount || 0;
    const refundAmount = cancelAmount || payment.amount; // Default to full if not specified

    // Idempotency: If already fully refunded, don't process again (especially for callbacks)
    if (currentRefunded >= payment.amount) {
        console.log(`Payment ${paymentId} already fully refunded. Skipping update.`);
        return { success: true };
    }

    // Cap the new refund amount at the total payment amount to prevent over-refund
    let newRefundedTotal = currentRefunded + refundAmount;
    if (newRefundedTotal > payment.amount) {
        console.warn(`Refund amount exceeds total. Capping at full amount. (${newRefundedTotal} > ${payment.amount})`);
        newRefundedTotal = payment.amount;
    }

    // Determine if fully cancelled
    // Allow for small floating point errors if needed, but we use integer logic mostly
    const isFullyRefunded = newRefundedTotal >= payment.amount;

    // Status update logic:
    // If fully refunded -> CANCELLED
    // If partially -> keep COMPLETED but update refunded amount (or add PARTIAL_REFUNDED status if schema supported)
    // For now, let's keep it simple: if fully refunded, mark CANCELLED.
    const newStatus = isFullyRefunded ? 'CANCELLED' : 'COMPLETED';
    const apptStatus = isFullyRefunded ? 'CANCELLED' : 'CONFIRMED'; // Keep appt confirmed if partial?

    await prisma.$transaction([
        prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: newStatus,
                refundedAmount: newRefundedTotal,
                ...(paymentKey ? { paymentKey } : {})
            }
        }),
        // Only cancel appointment if full refund
        ...(isFullyRefunded ? [
            prisma.appointment.update({
                where: { id: payment.appointmentId },
                data: { status: apptStatus }
            })
        ] : [])
    ]);

    // Notify the Patient User
    try {
        if (payment.appointment.userId) {
            await createNotification({
                userId: payment.appointment.userId,
                type: 'PAYMENT_CANCELLED',
                message: isFullyRefunded
                    ? `Your payment has been fully cancelled and refunded.`
                    : `A partial refund of ${refundAmount.toLocaleString()} KRW has been processed.`,
                key: isFullyRefunded ? 'Notifications.payment_cancelled' : 'Notifications.payment_partially_refunded',
                params: isFullyRefunded ? undefined : { amount: refundAmount.toLocaleString() },
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

export async function cancelPayment(paymentId: string, reason: string, cancelAmount?: number) {
    const session = await auth();
    console.log("cancelPayment session:", JSON.stringify(session, null, 2));

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
        console.log("cancelPayment Unauthorized: Role is", (session?.user as any)?.role);
        return { success: false, error: "Unauthorized" }
    }

    const payment = await prisma.payment.findUnique({
        where: { id: paymentId }
    })

    if (!payment) {
        return { success: false, error: "Payment not found" }
    }

    // Special handling for PENDING payments (void/cancel without PG refund)
    if (payment.status === 'PENDING') {
        console.log(`Cancelling PENDING payment ${paymentId} (Void)`);

        await prisma.$transaction([
            prisma.payment.update({
                where: { id: paymentId },
                data: { status: 'CANCELLED' }
            }),
            prisma.appointment.update({
                where: { id: payment.appointmentId },
                data: { status: 'CANCELLED' }
            })
        ]);

        revalidatePath('/admin/dashboard');
        return { success: true };
    }

    // Kiwoom Pay Cancellation Logic (for COMPLETED payments)
    const KIWOOM_MID = process.env.NEXT_PUBLIC_KIWOOM_MID;
    const AUTH_KEY = process.env.KIWOOM_AUTH_KEY; // Secret Key

    if (!payment.paymentKey) {
        return { success: false, error: "NO_PAYMENT_KEY" }
    }

    const currentRefunded = payment.refundedAmount || 0;
    const refundableAmount = payment.amount - currentRefunded;
    const requestAmount = cancelAmount || refundableAmount;

    if (requestAmount > refundableAmount) {
        return { success: false, error: "REFUND_AMOUNT_EXCEEDS_LIMIT" };
    }
    if (requestAmount <= 0) {
        return { success: false, error: "INVALID_REFUND_AMOUNT" };
    }

    // Bypass Kiwoom API for simulated test transactions
    if (payment.paymentKey.startsWith("TX_SIM_")) {
        console.log("Simulated payment cancellation - bypassing gateway");
        await processCancellationSuccess(paymentId, payment.paymentKey, requestAmount);
        return { success: true };
    }

    try {
        const payload = {
            CPID: KIWOOM_MID,
            PAYMETHOD: "CARD", // Assuming Card for now, in real app might need dynamic method
            AMOUNT: requestAmount.toString(),
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

        // Decode Ready Response
        const readyBuffer = await readyRes.arrayBuffer();
        const readyDecoded = iconv.decode(Buffer.from(readyBuffer), 'euc-kr');
        const readyData = JSON.parse(readyDecoded);

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

        // Decode Final Response
        const finalBuffer = await finalRes.arrayBuffer();
        const finalDecoded = iconv.decode(Buffer.from(finalBuffer), 'euc-kr');
        const finalData = JSON.parse(finalDecoded);
        console.log("Kiwoom Cancel Result:", finalData);

        // Check RESULTCODE
        if (finalData.RESULTCODE === "0000") {
            // Success - Use shared helper
            await processCancellationSuccess(paymentId, undefined, requestAmount);
            return { success: true }
        } else {
            return { success: false, error: finalData.ERRORMESSAGE || "Cancellation Failed" }
        }

    } catch (error: any) {
        console.error("Cancel Payment Error:", error);
        return { success: false, error: "Internal Server Error" };
    }
}
