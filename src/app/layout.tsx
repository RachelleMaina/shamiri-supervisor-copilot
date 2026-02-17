import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Suspense } from "react";
import { ReactQueryProvider } from "./QueryProvider";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Shamiri Supervisor Copilot",
  description:
    "Dashboard for supervisors to review therapy sessions and AI-generated insights. Monitor session quality and risk safely.",
  keywords: [
    "mental health",
    "Shamiri",
    "therapy sessions",
    "supervisor dashboard",
    "AI insights",
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <body className={`${roboto.variable} antialiased`}>
      <ReactQueryProvider>
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'Roboto, sans-serif',
            },
          }}
        />

        <Suspense fallback={<div>Loading...</div>}>
          {children}
        </Suspense>
      </ReactQueryProvider>
    </body>
  </html>
  );
}
