"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  useEffect(() => {
    async function handleAuthCallback() {
      const params = new URLSearchParams(window.location.search);
      const next = params.get("next") || "/dashboard";

      await supabase.auth.getSession();

      window.location.replace(next);
    }

    handleAuthCallback();
  }, []);

  return (
    <main className="mx-auto max-w-md p-4">
      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-600">Bezig met inloggen...</p>
      </div>
    </main>
  );
}