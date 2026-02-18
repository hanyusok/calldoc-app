"use server";

import { prisma } from "@/app/lib/prisma";
import * as soap from "soap";
import { Client as FtpClient } from "basic-ftp";
import { Readable } from "stream";
import { createNotification } from "@/app/actions/notification";
import { auth } from "@/auth";

const BAROBILL_CERT_KEY = process.env.BAROBILL_CERT_KEY!;
const BAROBILL_WSDL = process.env.BAROBILL_WSDL!;
const BAROBILL_CORP_NUM = process.env.BAROBILL_CORP_NUM || "1234567890";
const BAROBILL_USER_ID = process.env.BAROBILL_USER_ID || "testuser";
const BAROBILL_SENDER_NUMBER = process.env.BAROBILL_SENDER_NUMBER || "00000000";

// FTP Configuration
const FTP_HOST = process.env.BAROBILL_FTP_HOST || "testftp.barobill.co.kr";
const FTP_USER = process.env.BAROBILL_FTP_USER || BAROBILL_USER_ID;
const FTP_PASSWORD = process.env.BAROBILL_FTP_PASSWORD || "";

export async function sendFax(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        console.error("[Fax] Unauthorized attempt");
        return { error: "Unauthorized" };
    }

    try {
        console.log("[Fax] sendFax action called");
        const file = formData.get("file") as File;
        const prescriptionId = formData.get("prescriptionId") as string;

        if (!file || !prescriptionId) {
            console.error("[Fax] Missing file or prescription ID");
            return { error: "Missing file or prescription ID" };
        }

        const prescription = await prisma.prescription.findUnique({
            where: { id: prescriptionId },
            include: { appointment: { include: { user: true } } }
        });

        if (!prescription) {
            console.error("[Fax] Prescription not found:", prescriptionId);
            return { error: "Prescription not found" };
        }

        const receiverFax = prescription.pharmacyFax;
        const receiverName = prescription.pharmacyName || "Pharmacy";

        if (!receiverFax) {
            console.error("[Fax] Pharmacy fax number is missing for prescription:", prescriptionId);
            return { error: "Pharmacy fax number is missing" };
        }

        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`; // Sanitize filename
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log(`[Fax] Starting process for Prescription ${prescriptionId}`);
        console.log(`[Fax] Receiver: ${receiverName} (${receiverFax})`);

        // 1. Upload to FTP
        const ftpPort = parseInt(process.env.BAROBILL_FTP_PORT || "9030");
        console.log(`[Fax] Uploading ${fileName} to FTP (${FTP_HOST}:${ftpPort})...`);
        const ftp = new FtpClient(30000); // Set timeout to 30s

        try {
            await ftp.access({
                host: FTP_HOST,
                user: FTP_USER,
                password: FTP_PASSWORD,
                port: ftpPort,
                secure: false,
            });

            const source = Readable.from(buffer);
            await ftp.uploadFrom(source, fileName);
            console.log("[Fax] FTP Upload Successful");

        } catch (ftpError) {
            console.error("[Fax] FTP Error:", ftpError);
            return { error: `FTP Upload Failed: ${(ftpError as Error).message}` };
        } finally {
            ftp.close();
        }

        // 2. Call SendFaxFromFTP
        console.log("[Fax] Connecting to BaroBill SOAP Service...");
        const client = await soap.createClientAsync(BAROBILL_WSDL);

        console.log("[Fax] Sending Fax via FTP reference...");
        console.log(`[Fax] Params: SenderID=${BAROBILL_USER_ID}, From=${BAROBILL_SENDER_NUMBER}, To=${receiverFax}`);

        const sendArgs = {
            CERTKEY: BAROBILL_CERT_KEY,
            CorpNum: BAROBILL_CORP_NUM,
            SenderID: BAROBILL_USER_ID,
            FileName: fileName,
            FromNumber: BAROBILL_SENDER_NUMBER,
            ToNumber: receiverFax,
            ReceiveCorp: receiverName,
            ReceiveName: receiverName,
            SendDT: "",
            RefKey: ""
        };

        const sendResponse = await client.SendFaxFromFTPAsync(sendArgs);
        const result = sendResponse[0].SendFaxFromFTPResult;

        console.log(`[Fax] SendFaxFromFTP Result: ${result}`);

        if (!result || (parseInt(result) < 0)) {
            // Notify Failure
            await createNotification({
                userId: prescription.appointment.userId,
                type: 'FAX_FAILED',
                message: `Fax transmission failed. Code: ${result}`,
                key: 'Notifications.fax_failed',
                params: { error: result }
            });
            return { error: `Fax Failed with Code: ${result}` };
        }

        // Update Prescription Status
        await prisma.prescription.update({
            where: { id: prescriptionId },
            data: { status: 'ISSUED' } // or 'SENT' if added to enum. Using ISSUED for now as it means "Done"
        });

        // Notify Success
        await createNotification({
            userId: prescription.appointment.userId,
            type: 'FAX_SENT',
            message: `Prescription faxed successfully to ${receiverName}`,
            key: 'Notifications.fax_sent',
            params: { name: receiverName }
        });

        return { success: true, result };

    } catch (error) {
        console.error("Fax Error:", error);
        return { error: "Internal Server Error during Fax sending" };
    }
}

export async function sendManualFax(formData: FormData) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
        console.error("[Fax] Unauthorized manual fax attempt");
        return { error: "Unauthorized" };
    }

    try {
        console.log("[Fax] sendManualFax action called");
        const file = formData.get("file") as File;
        const receiverName = formData.get("receiverName") as string;
        const receiverFax = formData.get("receiverFax") as string;

        if (!file || !receiverName || !receiverFax) {
            console.error("[Fax] Missing required fields for manual fax");
            return { error: "Missing file, receiver name, or fax number" };
        }

        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log(`[Fax] Starting manual fax to ${receiverName} (${receiverFax})`);

        // 1. Upload to FTP
        const ftpPort = parseInt(process.env.BAROBILL_FTP_PORT || "9030");
        console.log(`[Fax] Uploading ${fileName} to FTP...`);
        const ftp = new FtpClient(30000);

        try {
            await ftp.access({
                host: FTP_HOST,
                user: FTP_USER,
                password: FTP_PASSWORD,
                port: ftpPort,
                secure: false,
            });

            const source = Readable.from(buffer);
            await ftp.uploadFrom(source, fileName);
            console.log("[Fax] FTP Upload Successful");

        } catch (ftpError) {
            console.error("[Fax] FTP Error:", ftpError);
            return { error: `FTP Upload Failed: ${(ftpError as Error).message}` };
        } finally {
            ftp.close();
        }

        // 2. Call SendFaxFromFTP
        console.log("[Fax] Connecting to BaroBill SOAP Service...");
        const client = await soap.createClientAsync(BAROBILL_WSDL);

        const sendArgs = {
            CERTKEY: BAROBILL_CERT_KEY,
            CorpNum: BAROBILL_CORP_NUM,
            SenderID: BAROBILL_USER_ID,
            FileName: fileName,
            FromNumber: BAROBILL_SENDER_NUMBER,
            ToNumber: receiverFax,
            ReceiveCorp: receiverName,
            ReceiveName: receiverName,
            SendDT: "",
            RefKey: ""
        };

        const sendResponse = await client.SendFaxFromFTPAsync(sendArgs);
        const result = sendResponse[0].SendFaxFromFTPResult;

        console.log(`[Fax] Manual SendFaxFromFTP Result: ${result}`);

        if (!result || (parseInt(result) < 0)) {
            return { error: `Fax Failed with Code: ${result}` };
        }

        // Return success (Notification can be added here if we want Admin logs)
        return { success: true, result };

    } catch (error) {
        console.error("Manual Fax Error:", error);
        return { error: "Internal Server Error during manual fax sending" };
    }
}
