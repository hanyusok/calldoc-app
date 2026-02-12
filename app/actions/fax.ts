"use server";

import { prisma } from "@/app/lib/prisma";
import * as soap from "soap";
import { Client as FtpClient } from "basic-ftp";
import { Readable } from "stream";

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
    try {
        const file = formData.get("file") as File;
        const prescriptionId = formData.get("prescriptionId") as string;

        if (!file || !prescriptionId) return { error: "Missing file or prescription ID" };

        const prescription = await prisma.prescription.findUnique({
            where: { id: prescriptionId },
            include: { appointment: { include: { user: true } } }
        });

        if (!prescription) return { error: "Prescription not found" };

        const receiverFax = prescription.pharmacyFax;
        const receiverName = prescription.pharmacyName || "Pharmacy";

        if (!receiverFax) {
            return { error: "Pharmacy fax number is missing" };
        }

        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`; // Sanitize filename
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log(`[Fax] Starting process for Prescription ${prescriptionId}`);

        // 1. Upload to FTP
        const ftpPort = parseInt(process.env.BAROBILL_FTP_PORT || "9030");
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

        console.log(`[Fax] SendFaxFromFTP Result: ${result}`);

        if (!result || (parseInt(result) < 0)) {
            return { error: `Fax Failed with Code: ${result}` };
        }

        return { success: true, result };

    } catch (error) {
        console.error("Fax Error:", error);
        return { error: "Internal Server Error during Fax sending" };
    }
}
