import type { Metadata } from "next";
import "./globals.css";
import RevenueCatProvider from "@/components/RevenueCatProvider";

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
      <body>
        <RevenueCatProvider>
          {children}
        </RevenueCatProvider>
      </body>
    </html>
  );
}