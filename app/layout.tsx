import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Recon — Broker Portal",
  description: "Check your loads' status, review flags, and respond — for carriers working with Recon.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
