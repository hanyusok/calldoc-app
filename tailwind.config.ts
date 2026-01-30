import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#FF4F6E", // DoctorNow-ish pink/red
                    50: "#FFF0F3",
                    100: "#FFE3E8",
                    200: "#FFC7D1",
                    300: "#FFA8B8",
                    400: "#FF7D96",
                    500: "#FF4F6E",
                    600: "#E63554",
                    700: "#BF1D3C",
                    800: "#9E1C34",
                    900: "#851B2E",
                    950: "#4A0A17",
                },
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'sans-serif'],
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            }
        },
    },
    plugins: [],
};
export default config;
