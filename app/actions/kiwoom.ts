"use server";

export async function getKiwoomHash(params: {
    CPID: string;
    PAYMETHOD: string;
    ORDERNO: string;
    TYPE: string;
    AMOUNT: string;
}) {
    // Replicate logic from getKiwoomENC.jsp
    const url = process.env.KIWOOM_HASH_API_URL || "https://apitest.kiwoompay.co.kr/pay/hash";
    const authKey = process.env.KIWOOM_AUTH_KEY!;

    console.log("Requesting Kiwoom Hash for:", params);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": authKey
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            console.error("Kiwoom Hash API Error Status:", response.status);
            return { success: false, error: `API Error: ${response.status}` };
        }

        const data = await response.json();
        console.log("Kiwoom Hash Response:", data);

        if (data.KIWOOM_ENC) {
            return { success: true, KIWOOM_ENC: data.KIWOOM_ENC };
        } else {
            return { success: false, error: "No KIWOOM_ENC in response" };
        }

    } catch (error) {
        console.error("Kiwoom Hash Error:", error);
        return { success: false, error: "Internal Server Error" };
    }
}

export async function kiwoomCancelPayment(params: {
    TRXID: string;
    AMOUNT: string;
    CANCELREASON: string;
    PAYMETHOD?: string;
}) {
    const KIWOOM_MID = process.env.NEXT_PUBLIC_KIWOOM_MID;
    const AUTH_KEY = process.env.KIWOOM_AUTH_KEY;
    const urlReady = "https://apitest.kiwoompay.co.kr/pay/ready";

    const payload = {
        CPID: KIWOOM_MID,
        PAYMETHOD: params.PAYMETHOD || "CARD",
        AMOUNT: params.AMOUNT,
        CANCELREQ: "Y",
        TRXID: params.TRXID,
        CANCELREASON: params.CANCELREASON,
        TAXFREEAMT: "0"
    };

    const iconv = require('iconv-lite');
    const jsonPayload = JSON.stringify(payload);
    const eucKrPayload = iconv.encode(jsonPayload, 'euc-kr');

    try {
        // Step 1: Ready
        const readyRes = await fetch(urlReady, {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=EUC-KR",
                "Authorization": AUTH_KEY || ""
            },
            body: eucKrPayload
        });

        if (!readyRes.ok) throw new Error(`Kiwoom Ready API Failed: ${readyRes.status}`);

        const readyBuffer = await readyRes.arrayBuffer();
        const readyData = JSON.parse(iconv.decode(Buffer.from(readyBuffer), 'euc-kr'));
        const { TOKEN, RETURNURL } = readyData;

        if (!TOKEN || !RETURNURL) throw new Error("Kiwoom Cancel Ready Failed: Missing TOKEN or RETURNURL");

        // Step 2: Final
        const finalRes = await fetch(RETURNURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=EUC-KR",
                "Authorization": AUTH_KEY || "",
                "TOKEN": TOKEN
            },
            body: eucKrPayload
        });

        if (!finalRes.ok) throw new Error(`Kiwoom Final API Failed: ${finalRes.status}`);

        const finalBuffer = await finalRes.arrayBuffer();
        const finalData = JSON.parse(iconv.decode(Buffer.from(finalBuffer), 'euc-kr'));

        return {
            success: finalData.RESULTCODE === "0000",
            error: finalData.RESULTCODE !== "0000" ? finalData.ERRORMESSAGE : undefined,
            data: finalData
        };

    } catch (error: any) {
        console.error("kiwoomCancelPayment error:", error);
        return { success: false, error: error.message };
    }
}
