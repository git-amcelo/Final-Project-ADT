/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#E8E4DD",
                accent: "#E63B2E",
                background: "#F5F3EE",
                textdark: "#111111"
            },
            fontFamily: {
                heading: ["'Space Grotesk'", "sans-serif"],
                drama: ["'DM Serif Display'", "serif"],
                mono: ["'Space Mono'", "monospace"],
            },
            borderRadius: {
                '2rem': '2rem',
                '3rem': '3rem',
            }
        },
    },
    plugins: [],
}
