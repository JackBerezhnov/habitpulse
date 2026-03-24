import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from './providers'

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: '--font-pixel',
});

export const metadata: Metadata = {
  title: "HabitPulse",
  description: "Habit Tracking App",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="pixel" className={pixelFont.variable}>
      <body className="font-pixel">
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
}
