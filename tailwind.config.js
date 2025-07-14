/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Noka', 'Inter', 'system-ui', 'sans-serif'],
                noka: ['Noka', 'Inter', 'system-ui', 'sans-serif'],
            },
            fontWeight: {
                'hairline': '100',
                'light': '300',
                'medium': '500',
                'semibold': '600',
                'bold': '700',
                'black': '900',
            },
            fontSize: {
                '2xs': '0.625rem', // 10px
            },
        },
    },
    plugins: [],
} 
