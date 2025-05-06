import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "./providers";
import { ServerInit } from "./components/ServerInit";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Student Enrollment System",
  description: "A modern student enrollment system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Initialize server-side components */}
        <ServerInit />
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
