import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Local File Transfer",
  description: "High-speed P2P local network file sharing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      {/* Setting the default dark background and text colors to match the UI theme */}
      <body className={`${inter.className} bg-[#1e2029] text-gray-100 antialiased min-h-screen`}>
        <SmoothScroll>
          <main className="max-w-7xl mx-auto p-6 md:p-12">
            {children}
          </main>
        </SmoothScroll>
      </body>
    </html>
  );
}
