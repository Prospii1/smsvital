import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/components/Providers";
import { ToastHost } from "@/components/ui/Primitives";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smsvital — Instant Phone Verification",
  description: "Buy disposable phone numbers for any app verification. 600+ services, 150+ countries, live in seconds.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <AppProvider>
          <ToastHost>
            {children}
          </ToastHost>
        </AppProvider>
      </body>
    </html>
  );
}
