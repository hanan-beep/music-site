// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Rubik, Heebo } from "next/font/google";
import "./globals.css";
import HamburgerMenu from "./HamburgerMenu";
import { PlayerProvider } from "./PlayerContext";
import { HistoryProvider } from "./HistoryContext";
import { FavoritesProvider } from "./FavoritesContext";
import { AuthProvider } from "./AuthContext";
import GlobalPlayer from "./GlobalPlayer";
import LoginBanner from "./LoginBanner";
import GlobalSearch from "./GlobalSearch";
import ServiceWorkerRegister from "./ServiceWorkerRegister";
import Script from "next/script";

const rubik = Rubik({ variable: "--font-display", subsets: ["hebrew", "latin"], weight: ["600", "800"] });
const heebo = Heebo({ variable: "--font-body", subsets: ["hebrew", "latin"] });

export const metadata: Metadata = {
  title: "יאללה שירים 💪",
  description: "הארכיון המוזיקלי החרדי הגדול ביותר",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "יאללה שירים" },
};

export const viewport: Viewport = { themeColor: "#DD2476" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" className={`${rubik.variable} ${heebo.variable} h-full antialiased`}>
      <head>
        <link rel="apple-touch-icon" href="/logo.png" />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-Y6JS9FP537" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-Y6JS9FP537');
        `}</Script>
      </head>
      <body className="min-h-full flex flex-col pb-36">
        <ServiceWorkerRegister />
        <AuthProvider>
          <PlayerProvider>
            <HistoryProvider>
              <FavoritesProvider>
                <HamburgerMenu />
                <GlobalSearch />
                <LoginBanner />
                {children}
                <GlobalPlayer />
              </FavoritesProvider>
            </HistoryProvider>
          </PlayerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
