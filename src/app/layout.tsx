import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: "Weight Quest RPG - Gamified Weight Loss Tracker",
  description: "Transform your weight loss journey into an epic RPG adventure! Track your progress, level up, and achieve your goals with pixel art aesthetics.",
  keywords: ["weight loss", "tracker", "RPG", "gamified", "pixel art", "fitness"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${pixelFont.variable} ${pixelFont.className}`}>
        {children}
      </body>
    </html>
  );
}
