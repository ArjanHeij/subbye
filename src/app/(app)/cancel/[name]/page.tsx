"use client";

import { useEffect, useState } from "react";

export default function CancelPage({ params }: any) {
  const serviceName = decodeURIComponent(params.name);

  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  async function generateEmail() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/ai/cancel-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "AI generatie mislukt");
      }

      setSubject(data.subject || "");
      setBody(data.body || "");
    } catch (err: any) {
      setError(err.message ?? "Er ging iets mis");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    generateEmail();
  }, []);

  async function copyText() {
    await navigator.clipboard.writeText(
      `Onderwerp: ${subject}\n\n${body}`
    );
  }

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-2xl font-semibold">Cancel abonnement</h1>

      <p className="mt-1 text-gray-500">
        AI maakt een opzegmail voor {serviceName}
      </p>

      <div className="mt-6 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="text-sm font-medium text-gray-700">Service</div>
        <div className="mt-1 text-lg font-semibold">{serviceName}</div>
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
            <div className="mt-2 rounded-xl bg-gray-50 p-3 text-sm">
              {subject}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="text-sm font-medium text-gray-700">Bericht</div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="mt-2 min-h-[220px] w-full rounded-xl border p-3 text-sm"
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