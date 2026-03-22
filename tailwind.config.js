/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'trust-green': '#16a34a',
        'trust-amber': '#f59e0b',
        'trust-red': '#dc2626',
        'trust-blue': '#2563eb',
        'obsidian': '#050505',
      },
      backgroundColor: {
        'obsidian': '#050505',
      },
    },
  },
  safelist: [
    'bg-obsidian',
    'glass-card',
    'glass-card-hover',
    'text-muted-oklch',
    {
      pattern: /risk-(low|medium|high)/,
    },
  ],
  plugins: [],
}
