"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PopupCloseHandler({ redirectUrl }: { redirectUrl: string }) {
    const router = useRouter();

    useEffect(() => {
        // Check if we are in a popup (opener exists and is not self)
        if (window.opener && window.opener !== window) {
            console.log("Payment Success: Inside Popup, refreshing opener and closing...");
            (async () => {
                try {
                    // Wait for server callback to process before redirecting
                    // This gives the Kiwoom server-to-server callback time to update the DB
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    // Redirect opener to the appointment page with fresh data
                    window.opener.location.href = redirectUrl;

                    // Allow time for the redirect to initiate, then close popup
                    setTimeout(() => {
                        window.close();
                    }, 500);
                } catch (e) {
                    console.error("Failed to interact with opener:", e);
                    router.replace(redirectUrl);
                }
            })();
        } else {
            // Not a popup (Mobile flow or direct visit)
            // implementing a timer for convenience:
            const timer = setTimeout(() => {
                router.replace(redirectUrl);
            }, 3000); // 3 seconds auto redirect for mobile/full page

            return () => clearTimeout(timer);
        }
    }, [redirectUrl, router]);

    return null; // This component handles logic only, no UI
}
