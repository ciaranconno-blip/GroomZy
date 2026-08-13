import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/TopNav";
import { BottomNav } from "@/components/BottomNav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GroomZy — Dog Grooming, Booked Properly",
  description:
    "Book with your local dog groomer in Ireland. Fixed slots for straightforward coats, a real conversation for the double-coated ones.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col text-white selection:bg-indigo-500 selection:text-white relative">
        <div className="mesh-bg" />
        <div className="relative z-10 flex flex-col min-h-full">
          <TopNav />
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-10">
            {children}
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
