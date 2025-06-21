/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            // Add a custom font family. You'll need to import the font files via @font-face.
            fontFamily: {
                'roc-grotesk': ['"Roc Grotesk"', 'sans-serif'],
            },
            // Add custom colors from the image to use in your app.
            colors: {
                'brand-blue-logo': '#1E40AF',   // The darker blue for the "pip" logo
                'brand-blue-banner': '#2563EB', // The brighter blue for the banner and icons
            }
        },
    },
    plugins: [],
}