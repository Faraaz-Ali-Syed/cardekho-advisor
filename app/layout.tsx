import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "CarDekho Advisor — find your right car",
  description:
    "AI-powered car shortlisting: tell us about your needs and we'll help you go from confused to confident.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        <footer className="max-w-6xl mx-auto px-4 py-8 text-xs text-slate-500">
          Demo build for CarDekho take-home · dataset is representative, not live pricing.
        </footer>
      </body>
    </html>
  );
}
