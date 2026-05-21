"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  useEffect(() => {
    async function handleAuthCallback() {
      const url = new URL(window.location.href);
      const next = url.searchParams.get("next") || "/dashboard";

      try {
        const code = url.searchParams.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error("exchangeCodeForSession error:", error.message);
          }
        }

        const hashParams = new URLSearchParams(
          window.location.hash.replace("#", "")
        );

        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("setSession error:", error.message);
          }
        }
      } catch (error) {
        console.error("Auth callback error:", error);
      }

      window.location.replace(next);
    }

    handleAuthCallback();
  }, []);

  return (
    <main className="mx-auto max-w-md p-4">
      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-600">Bezig met verwerken...</p>
      </div>
    </main>
  );
}