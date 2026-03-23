import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SubBye",
  description: "Stop met geld verliezen aan vergeten abonnementen",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}