import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "@/components/ui/Toast";

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
    <html lang="en">
      <body>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
