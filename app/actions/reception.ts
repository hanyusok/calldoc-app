"use server";

import { auth } from "@/auth";

// const API_BASE_URL = "http://api.calldoc.co.kr/api";
const API_BASE_URL = "http://hanyusok.synology.me:3000/api";

export async function registerToClinic(name: string, residentNumber: string) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    if (!name || !residentNumber) {
        return { success: false, error: "Name and Resident Number are required." };
    }

    // Parse resident number (YYMMDD-XXXXXXX) to YYYY-MM-DD
    const birthPart = residentNumber.split("-")[0];
    if (!birthPart || birthPart.length !== 6) {
        return { success: false, error: "Invalid resident number format." };
    }

    // Basic logic to determine century (e.g., 00-24 -> 2000s, 25-99 -> 1900s)
    const yy = parseInt(birthPart.substring(0, 2), 10);
    const mm = birthPart.substring(2, 4);
    const dd = birthPart.substring(4, 6);
    const year = yy <= new Date().getFullYear() % 100 ? 2000 + yy : 1900 + yy;
    const pbirth = `${year}${mm}${dd}`;

    try {
        // Step 1: Search for person
        const searchUrl = `${API_BASE_URL}/persons/search?pname=${encodeURIComponent(name)}&pbirth=${encodeURIComponent(pbirth)}`;
        const searchRes = await fetch(searchUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (!searchRes.ok) {
            console.error("Failed to search person:", searchRes.statusText);
            return { success: false, error: "Failed to communicate with clinic server." };
        }

        const persons = await searchRes.json();
        if (!persons || persons.length === 0) {
            return { success: false, error: "Person not found in clinic records." };
        }

        const person = persons[0]; // Assume first match
        const pcode = person.PCODE;

        if (!pcode) {
            return { success: false, error: "Invalid person data received from clinic." };
        }

        // Format today's date for VISIDATE (YYYYMMDD)
        const today = new Date();
        const visidateFormatted = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

        // Ensure not already registered
        try {
            const checkRes = await fetch(`${API_BASE_URL}/mtswait/date/${visidateFormatted}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
            if (checkRes.ok) {
                const existingRegistrations = await checkRes.json();
                if (Array.isArray(existingRegistrations)) {
                    const alreadyRegistered = existingRegistrations.some((reg: any) => reg.PCODE === pcode);
                    if (alreadyRegistered) {
                        return { success: false, error: "이미 오늘 클리닉에 접수된 환자입니다." };
                    }
                }
            }
        } catch (e) {
            // Check error might be 404 (Brand new day, nobody registered) which is fine.
            console.log("Check registration error (might be expected):", e);
        }

        // Step 2: Register to Waitlist
        const registerBody = {
            PCODE: pcode,
            VISIDATE: visidateFormatted
        };

        const registerRes = await fetch(`${API_BASE_URL}/mtswait`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(registerBody)
        });

        if (!registerRes.ok) {
            console.error("Failed to register person to waitlist:", await registerRes.text());
            return { success: false, error: "Failed to register person to the clinic waitlist." };
        }

        return { success: true };

    } catch (error: any) {
        console.error("Clinic Reception API Error details:", error.message || error, error.cause);
        return { success: false, error: `Internal server error occurred while contacting clinic API: ${error.message || "Unknown error"}` };
    }
}
