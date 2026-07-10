import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "District Operations Playbook",
  description: "District budget and operations dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
