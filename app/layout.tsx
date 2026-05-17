// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import HamburgerMenu from "./HamburgerMenu";
import { PlayerProvider } from "./PlayerContext";
import GlobalPlayer from "./GlobalPlayer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "יאללה שירים 💪",
  description: "הארכיון המוזיקלי החרדי הגדול ביותר",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <PlayerProvider>
          <HamburgerMenu />
          {children}
          <GlobalPlayer />
        </PlayerProvider>
      </body>
    </html>
  );
}
