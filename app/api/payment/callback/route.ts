import { prisma } from '@/app/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        // Handle both JSON (Simulation) and Form Data (Real PG)
        const contentType = req.headers.get('content-type') || '';
        let appointmentId, result;

        if (contentType.includes('application/json')) {
            const body = await req.json();
            appointmentId = body.appointmentId;
            result = body.result;
        } else {
            // Typical PG callback is Form Data
            const formData = await req.formData();
            // In a real scenario, we would look up the appointment via OrderNo
            // For this mockup, we might not have the ID directly unless we stored OrderNo -> ID mapping
            // But since the Simulation is the primary path we are testing now, we focus on JSON.
            // If real PG, we'd do: const orderNo = formData.get('ORDER_NO');
            result = 'SUCCESS'; // Assume success for now if we got here
        }

        if (result === 'SUCCESS' && appointmentId) {
            await prisma.appointment.update({
                where: { id: appointmentId },
                data: { status: 'CONFIRMED' }
            });

            // KiwoomPay often expects a specific XML response
            return new NextResponse('<RESULT>SUCCESS</RESULT>', {
                headers: { 'Content-Type': 'text/xml' }
            });
        }

        return NextResponse.json({ success: false }, { status: 400 });

    } catch (error) {
        console.error("Payment Callback Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
