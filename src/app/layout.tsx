import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Nunito, DM_Serif_Display, Amiri } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Between You & The Qur'an",
  description: "Come as you are.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Between You & The Qur'an",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cormorant.variable} ${nunito.variable} ${dmSerif.variable} ${amiri.variable} antialiased`}
      >
        {/* Manuscript lighting — vignette + radial illumination */}
        <div className="manuscript-light" aria-hidden="true" />

        {/* Mobile app shell */}
        <AuthProvider>
          <div className="app-shell">
            <main className="relative z-10">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
