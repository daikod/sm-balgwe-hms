import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SM BALGWE HMS",
  description: "Built by Dr Philip Ikeme",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`--webkit-font-smoothing: antialiased suppressHydrationWarning={true}`}>
        <ClerkProvider>
        {children}
        <Toaster richColors position="top-center" />
        </ClerkProvider>
      </body>
    </html>
  );
}
