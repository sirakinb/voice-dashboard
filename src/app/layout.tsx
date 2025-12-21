import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CanvasProvider } from "@/lib/canvas-context";
import { DemoProvider } from "@/lib/demo-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jackson Rental Homes Voice Dashboard",
  description: "Voice analytics for Jackson Rental Homes connected to Zoho.",
  icons: {
    icon: [
      { url: "/jackson_favicon.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/jackson_favicon.png",
    apple: "/jackson_favicon.png",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DemoProvider>
          <CanvasProvider>{children}</CanvasProvider>
        </DemoProvider>
      </body>
    </html>
  );
}
