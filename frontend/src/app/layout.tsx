import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import FloatingNav from "@/components/FloatingNav";
import DesktopSidebar from "@/components/DesktopSidebar"; // 1. Import the new sidebar

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Colace",
  description: "A social platform for your college.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900`}>
        {/* The new sidebar component is added here */}
        <DesktopSidebar /> 
        
        {/* The main content area now has responsive padding */}
        <main className="pb-20 md:pb-0 md:ml-64"> {/* 2. Add left margin on desktop */}
          {children}
        </main>
        
        <FloatingNav />
      </body>
    </html>
  );
}