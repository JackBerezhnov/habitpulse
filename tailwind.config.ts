import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['var(--font-pixel)', 'monospace'],
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        pixel: {
          "primary": "#ffd700",
          "primary-content": "#1a1000",
          "secondary": "#8b5e28",
          "secondary-content": "#fff",
          "accent": "#22c55e",
          "accent-content": "#052e16",
          "neutral": "#1e1b3a",
          "neutral-content": "#e0e0e0",
          "base-100": "#0f0e2e",
          "base-200": "#1a1945",
          "base-300": "#2d1b4e",
          "base-content": "#e0e0e0",
          "info": "#3b82f6",
          "info-content": "#fff",
          "success": "#22c55e",
          "success-content": "#fff",
          "warning": "#f59e0b",
          "warning-content": "#000",
          "error": "#dc2626",
          "error-content": "#fff",
        },
      },
    ],
  },
};
export default config;
