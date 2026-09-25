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
    template: "%s | Law Centre II Student Union Grievance Portal",
    default: "Law Centre II Student Union Grievance Portal",
  },
  description:
    "Official grievance redressal portal of the Law Centre-II Student Union, Faculty of Law, University of Delhi. Submit, track, and resolve student complaints transparently.",
  keywords: ["grievance", "complaint", "Law Centre II", "Student Union", "Faculty of Law", "DU"],
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
