import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "@/components/ui/Toast";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | LAW CENTRE II Grievance Portal",
    default: "LAW CENTRE II Grievance Portal",
  },
  description:
    "Official grievance redressal portal for LAW CENTRE II. Submit, track, and resolve student complaints transparently.",
  keywords: ["grievance", "complaint", "LAW CENTRE II", "student portal"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
