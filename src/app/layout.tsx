import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DocMind",
  description: "Organize your academic life with AI.",
  manifest: "/manifest.json",
  themeColor: "#173450",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DocMind",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#051424] text-[#D9CBC2]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
