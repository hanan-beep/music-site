// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import HamburgerMenu from "./HamburgerMenu";
import { PlayerProvider } from "./PlayerContext";
import { HistoryProvider } from "./HistoryContext";
import { FavoritesProvider } from "./FavoritesContext";
import GlobalPlayer from "./GlobalPlayer";
import ServiceWorkerRegister from "./ServiceWorkerRegister";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "יאללה שירים 💪",
  description: "הארכיון המוזיקלי החרדי הגדול ביותר",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "יאללה שירים",
  },
};

export const viewport: Viewport = {
  themeColor: "#DD2476",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegister />
        <PlayerProvider>
          <HistoryProvider>
            <FavoritesProvider>
              <HamburgerMenu />
              {children}
              <GlobalPlayer />
            </FavoritesProvider>
          </HistoryProvider>
        </PlayerProvider>
      </body>
    </html>
  );
}
