"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth, config as authOptions } from "@/auth";
import { AppointmentStatus } from "@prisma/client";
// import { getServerSession } from "next-auth"; // Not available in v5 (beta)

import { createMeeting } from "./meet";
import { createNotification } from "./notification";
import { kiwoomCancelPayment } from "./kiwoom";

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
        productName: `진료 상담: ${appointment.doctor.name}`
    };
}

export async function getPaymentStatus(paymentId: string) {
    try {
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            select: { status: true }
        });

        if (!payment) {
            return { success: false, error: "Payment not found" };
        }

        return { success: true, status: payment.status };
    } catch (error) {
        console.error("Error fetching payment status:", error);
        return { success: false, error: "Internal Server Error" };
    }
}

export async function confirmPayment(paymentKey: string, orderId: string, amount: number, authNo?: string) {
    console.log("Processing Kiwoom payment:", { orderId, amount, paymentKey, authNo });

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

        // 2. Idempotency & Partial Update Check
        if (payment.status === 'COMPLETED') {
            // Check if we need to backfill missing keys (Client-side success page might have finished first without keys)
            // Only update if we HAVE a key to save, and the DB currently HAS NONE
            const incomingKey = paymentKey && paymentKey.trim() !== '' ? paymentKey : null;
            const incomingAuth = authNo && authNo.trim() !== '' ? authNo : null;

            const needsKeyUpdate = (!payment.paymentKey && incomingKey) || (!payment.authNo && incomingAuth);

            if (needsKeyUpdate) {
                console.log(`Payment ${orderId} already completed, but backfilling missing keys:`, { paymentKey: incomingKey, authNo: incomingAuth });
                await prisma.payment.update({
                    where: { id: orderId },
                    data: {
                        paymentKey: incomingKey || payment.paymentKey, // Keep existing if incoming is null
                        authNo: incomingAuth || payment.authNo
                    }
                });
                return { success: true, message: "Keys updated" };
            }

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
                    paymentKey: paymentKey || null, // Ensure empty string becomes null
                    authNo: authNo || null  // Save the Authorization Number (승인번호)
                }
            }),
            prisma.appointment.update({
                where: { id: payment.appointmentId },
                data: {
                    status: AppointmentStatus.CONFIRMED,
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
                        key: 'Notifications.payment_confirmed_admin',
                        params: JSON.stringify({
                            user: payment.appointment.user.name || 'Patient',
                            doctor: payment.appointment.doctor.name
                        }),
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
    const apptStatus = isFullyRefunded ? AppointmentStatus.CANCELLED : AppointmentStatus.CONFIRMED; // Keep appt confirmed if partial?

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
    console.log("cancelPayment session (auth()):", JSON.stringify(session, null, 2));

    // let sessionV4 = null;
    // try {
    //     // Attempt to use getServerSession if available/compatible
    //     // sessionV4 = await getServerSession(authOptions);
    //     console.log("getServerSession skipped (not available in v5)");
    // } catch (e) {
    //     console.log("getServerSession failed or not available:", e);
    // }

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
                data: { status: AppointmentStatus.CANCELLED }
            })
        ]);

        revalidatePath('/admin/dashboard');
        return { success: true };
    }

    // Kiwoom Pay Cancellation Logic (for COMPLETED payments)
    const KIWOOM_MID = process.env.NEXT_PUBLIC_KIWOOM_MID;
    const AUTH_KEY = process.env.KIWOOM_AUTH_KEY; // Secret Key

    const currentRefunded = payment.refundedAmount || 0;
    const refundableAmount = payment.amount - currentRefunded;
    const requestAmount = cancelAmount || refundableAmount;

    if (!payment.paymentKey) {
        console.warn(`Payment ${paymentId} has no paymentKey. Force cancelling locally (DB only).`);
        await processCancellationSuccess(paymentId, undefined, requestAmount);
        return { success: true };
    }

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
        const result = await kiwoomCancelPayment({
            TRXID: payment.paymentKey,
            AMOUNT: requestAmount.toString(),
            CANCELREASON: reason
        });

        if (result.success) {
            await processCancellationSuccess(paymentId, undefined, requestAmount);
            return { success: true };
        } else {
            return { success: false, error: result.error || "Cancellation Failed" };
        }

    } catch (error: any) {
        console.error("Cancel Payment Error:", error);
        return { success: false, error: error.message || "Internal Server Error" };
    }
}

// ===== MANUAL SYNC / FORCE CONFIRM =====
export async function syncPaymentStatus(paymentId: string, manualPaymentKey?: string) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
        return { success: false, error: "Unauthorized" };
    }

    const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { appointment: true }
    });

    if (!payment) return { success: false, error: "Payment not found" };

    if (payment.status === 'COMPLETED') {
        return { success: true, message: "Already completed" };
    }

    // specific logic: if we have a key, use it. if not, use manual.
    const keyToUse = payment.paymentKey || manualPaymentKey;

    if (!keyToUse) {
        return { success: false, error: "Missing Payment Key (Transaction ID). Please enter it manually." };
    }

    // In a real scenario, we would CALL Kiwoom API to verify the status of keyToUse.
    // Since we lack the specific "Query" API docs here, we will trust the Admin's input 
    // and assume if they provide the key, they verified it in the Kiwoom Dashboard.

    console.log(`Admin ${session.user.id} forcing completion of payment ${paymentId} with key ${keyToUse}`);

    await prisma.$transaction([
        prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: 'COMPLETED',
                approvedAt: new Date(),
                method: 'KIWOOM',
                paymentKey: keyToUse
            }
        }),
        prisma.appointment.update({
            where: { id: payment.appointmentId },
            data: { status: AppointmentStatus.CONFIRMED }
        })
    ]);

    revalidatePath('/admin/dashboard');
    return { success: true, message: "Payment status synced (forced)" };
}

// ===== ADMIN PAYMENT ACTIONS =====

export async function getAdminPayments(page: number = 1, status?: string) {
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    try {
        const where: any = {};
        if (status && status !== 'ALL') {
            where.status = status;
        }

        const [payments, total] = await Promise.all([
            prisma.payment.findMany({
                where,
                include: {
                    appointment: {
                        include: {
                            user: true,
                            doctor: true
                        }
                    }
                },
                orderBy: { requestedAt: 'desc' },
                skip,
                take: pageSize
            }),
            prisma.payment.count({ where })
        ]);

        return {
            success: true,
            data: payments,
            pagination: {
                current: page,
                total: Math.ceil(total / pageSize),
                totalRecords: total
            }
        };
    } catch (error) {
        console.error("Error fetching admin payments:", error);
        return { success: false, error: "Failed to fetch payments" };
    }
}

export async function checkNewPaidAppointments(knownPaymentIds: string[]) {
    try {
        // Find payments completed in the last hour (to avoid fetching old history on refresh)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        const newPayments = await prisma.payment.findMany({
            where: {
                status: 'COMPLETED',
                approvedAt: { gte: oneHourAgo }, // Changed from updatedAt
                id: { notIn: knownPaymentIds }
            },
            include: {
                appointment: {
                    include: {
                        user: true,
                        doctor: true
                    }
                }
            },
            orderBy: { approvedAt: 'desc' }, // Changed from updatedAt
            take: 5 // Limit to recent ones
        });

        return newPayments;
    } catch (error) {
        console.error("Error checking new paid appointments:", error);
        return [];
    }
}
export async function getDailyStats() {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const payments = await prisma.payment.findMany({
            where: {
                status: 'COMPLETED',
                approvedAt: { gte: thirtyDaysAgo }
            },
            select: {
                amount: true,
                approvedAt: true
            },
            orderBy: { approvedAt: 'asc' }
        });

        const statsMap = new Map<string, { total: number, count: number }>();

        payments.forEach(p => {
            if (!p.approvedAt) return;
            const dateKey = p.approvedAt.toISOString().split('T')[0];
            const existing = statsMap.get(dateKey) || { total: 0, count: 0 };
            statsMap.set(dateKey, {
                total: existing.total + p.amount,
                count: existing.count + 1
            });
        });

        const dailyStats = Array.from(statsMap.entries()).map(([date, data]) => ({
            date,
            ...data
        }));

        // Calculate today specifically
        const todayKey = new Date().toISOString().split('T')[0];
        const todayData = statsMap.get(todayKey) || { total: 0, count: 0 };

        const totalLast30Days = dailyStats.reduce((sum, d) => sum + d.total, 0);

        return {
            success: true,
            dailyStats,
            today: todayData,
            totalLast30Days
        };
    } catch (error) {
        console.error("Error fetching daily stats:", error);
        return { success: false, error: "Failed to fetch stats" };
    }
}
