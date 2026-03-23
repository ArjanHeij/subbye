"use client";

import type { ReactNode } from "react";
import { useRequireAuth } from "@/lib/useRequireAuth";
import MobileNav from "../../components/MobileNav";
import AppHeader from "../../components/AppHeader";
import Footer from "../../components/Footer";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { ready } = useRequireAuth();

  if (!ready) {
    return (
      <div className="mx-auto min-h-screen max-w-md bg-gray-50 p-4">
        <div className="rounded-xl border bg-white p-4">Laden...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-gray-50">
      <AppHeader />

      <div className="pb-24">
        {children}
        <Footer />
      </div>

      <MobileNav />
    </div>
  );
}