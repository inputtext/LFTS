import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fluid | Minimal File Transfer",
  description: "Seamless local network transfers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Eye-soothing pastel gradient background: Soft Peach to Pale Mint/Lavender */}
      <body className={`${inter.className} bg-gradient-to-br from-[#fff0f0] via-[#f3f4fb] to-[#e8fbf6] text-gray-800 antialiased min-h-screen flex items-center justify-center p-4`}>
        {children}
      </body>
    </html>
  );
}
