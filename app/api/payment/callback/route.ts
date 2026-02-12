import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

const allowedIPs = [
    '27.102.213.200', '27.102.213.201', '27.102.213.202', '27.102.213.203', // Production
    '27.102.213.206', // Prodcution Payment Window?
    '123.140.121.205', // Development
    '::1', '127.0.0.1' // Localhost
];

const handleCallback = async (req: NextRequest) => {
    try {
        const method = req.method;

        // 0. IP Validation
        const forwardedFor = req.headers.get("x-forwarded-for");
        const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : ((req as any).ip || "unknown");

        console.log(`Callback Request from IP: ${ip}`);

        const isAllowed = allowedIPs.includes(ip) || process.env.NODE_ENV === 'development';

        if (!isAllowed) {
            console.warn(`Unauthorized Callback Attempt from IP: ${ip}`);
            return new NextResponse("Unauthorized", { status: 403 });
        }

        let data: any = {};

        // 1. Parse Data (GET vs POST)
        if (method === 'GET') {
            const { searchParams } = new URL(req.url);
            searchParams.forEach((value, key) => {
                data[key] = value;
            });
        } else {
            // POST
            const contentType = req.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
                data = await req.json();
            } else {
                const formData = await req.formData();
                formData.forEach((value, key) => {
                    data[key] = value;
                });
            }
        }

        console.log(`Kiwoom Callback (${method}) Received:`, data);

        const { RES_CD, ORDERNO, AUTHNO, AMOUNT, DAOUTRX, PAYMETHOD, RES_MSG } = data;

        // 2. Handle Cancellation (PAYMETHOD: CARD_CANCEL)
        if (PAYMETHOD === 'CARD_CANCEL' || (RES_MSG && RES_MSG.includes("취소"))) {
            console.log("Processing Cancellation Callback...");

            // Find Payment
            let payment = null;
            if (ORDERNO) {
                payment = await prisma.payment.findUnique({ where: { id: ORDERNO }, include: { appointment: true } });
            }
            if (!payment && DAOUTRX) {
                payment = await prisma.payment.findUnique({ where: { paymentKey: DAOUTRX }, include: { appointment: true } });
            }

            if (payment) {
                const { processCancellationSuccess } = await import("@/app/actions/payment");
                await processCancellationSuccess(payment.id, DAOUTRX);

                return new NextResponse("OK", { status: 200 });
            } else {
                console.error("Payment not found for cancellation:", { ORDERNO, DAOUTRX });
                return new NextResponse("OK", { status: 200 });
            }
        }

        // 3. Handle Success
        const isSuccess = RES_CD === '0000' || (PAYMETHOD === 'CARD' && !!AUTHNO);

        if (isSuccess) {
            const paymentKey = DAOUTRX || AUTHNO;
            const amountInt = parseInt(AMOUNT || "0");

            const { confirmPayment } = await import("@/app/actions/payment");

            const result = await confirmPayment(paymentKey, ORDERNO, amountInt);

            if (result.success) {
                return new NextResponse("OK", { status: 200 });
            } else {
                console.error("Callback Confirmation Failed:", result.error);
                return new NextResponse("Internal Error", { status: 500 });
            }

        } else {
            console.warn(`Payment ${ORDERNO} failed: ${RES_MSG || 'No Error Message'}`);
            return new NextResponse("OK", { status: 200 });
        }

    } catch (error) {
        console.error("Callback Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
};

export async function POST(req: NextRequest) {
    return handleCallback(req);
}

export async function GET(req: NextRequest) {
    return handleCallback(req);
}
