"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function CancelPage() {
  const params = useParams();

  const serviceName = useMemo(() => {
    const raw =
      typeof params?.name === "string"
        ? params.name
        : Array.isArray(params?.name)
        ? params.name[0]
        : "";

    try {
      return raw ? decodeURIComponent(raw) : "";
    } catch {
      return raw || "";
    }
  }, [params]);

  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  async function generateEmail() {
    if (!serviceName) {
      setError("Geen geldige service gevonden in de URL.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSubject("");
      setBody("");

      const res = await fetch("/api/ai/cancel-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceName,
        }),
      });

      const rawText = await res.text();
      let data: any = null;

      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        data = null;
      }

      if (!res.ok) {
        throw new Error(
          data?.error || rawText || "AI generatie van opzegmail mislukt"
        );
      }

      setSubject(data?.subject || "");
      setBody(data?.body || "");
    } catch (err: any) {
      setError(err?.message ?? "Er ging iets mis");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    generateEmail();
  }, [serviceName]);

  async function copyText() {
    try {
      await navigator.clipboard.writeText(`Onderwerp: ${subject}\n\n${body}`);
    } catch {
      setError("Kopiëren mislukt");
    }
  }

  return (
    <main className="mx-auto max-w-md p-4 pb-24">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-950">
            Cancel abonnement
          </h1>
          <p className="mt-1 text-gray-500">
            AI maakt een opzegmail voor{" "}
            {serviceName || "je abonnement"}
          </p>
        </div>

        <Link
          href="/dashboard"
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900"
        >
          Terug
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="text-sm font-medium text-gray-700">Service</div>
        <div className="mt-1 text-lg font-semibold text-gray-950">
          {serviceName || "Onbekend"}
        </div>
      </div>

      {loading && (
        <div className="mt-4 rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
          AI opzegmail genereren...
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && subject && body && (
        <div className="mt-4 space-y-4">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="text-sm font-medium text-gray-700">Onderwerp</div>
            <div className="mt-2 rounded-xl bg-gray-50 p-3 text-sm text-gray-900">
              {subject}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="text-sm font-medium text-gray-700">Bericht</div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="mt-2 min-h-[220px] w-full rounded-xl border p-3 text-sm outline-none focus:border-black"
            />
          </div>

          <button
            onClick={copyText}
            className="w-full rounded-xl bg-black p-3 text-white"
          >
            Kopieer opzegmail
          </button>
        </div>
      )}
    </main>
  );
}