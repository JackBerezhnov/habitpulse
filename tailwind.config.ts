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
          "primary": "#e6b636",
          "primary-content": "#222034",
          "secondary": "#c6a676",
          "secondary-content": "#222034",
          "accent": "#3fbf3f",
          "accent-content": "#ffffff",
          "neutral": "#222034",
          "neutral-content": "#ffffff",
          "base-100": "#222034",
          "base-200": "#2a2040",
          "base-300": "#524c7d",
          "base-content": "#ffffff",
          "info": "#3f8fcf",
          "info-content": "#ffffff",
          "success": "#3fbf3f",
          "success-content": "#ffffff",
          "warning": "#e6b636",
          "warning-content": "#222034",
          "error": "#c12f2f",
          "error-content": "#ffffff",
        },
      },
    ],
  },
};
export default config;
