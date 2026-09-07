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
      <body className={`${inter.className} bg-[#fafafa] text-gray-800 antialiased min-h-screen w-full overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}
