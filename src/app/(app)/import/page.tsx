"use client";

import { useState } from "react";
import Papa from "papaparse";
import { supabase } from "@/lib/supabaseClient";

export default function ImportPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function normalizeDate(value: string) {
    if (!value) return null;

    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

    const match = trimmed.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
    if (match) {
      const [, day, month, year] = match;
      return `${year}-${month}-${day}`;
    }

    return null;
  }

  function normalizeAmount(value: string) {
    if (!value) return 0;
    return Number(value.replace(",", ".").replace(/[^\d.-]/g, ""));
  }

  async function handleFileUpload(file: File) {
    setLoading(true);
    setError("");
    setMessage("");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const { data: userData } = await supabase.auth.getUser();
          const user = userData.user;

          if (!user) throw new Error("Niet ingelogd");

          const rows = (results.data as any[])
            .map((row) => {
              const description =
                row.description ||
                row.Description ||
                row.omschrijving ||
                row.Omschrijving ||
                row.name ||
                row.Name ||
                "";

              const amount =
                row.amount ||
                row.Amount ||
                row.bedrag ||
                row.Bedrag ||
                "";

              const transactionDate =
                row.transaction_date ||
                row.TransactionDate ||
                row.date ||
                row.Date ||
                row.datum ||
                row.Datum ||
                "";

              return {
                user_id: user.id,
                description: String(description).trim(),
                amount: normalizeAmount(String(amount)),
                transaction_date: normalizeDate(String(transactionDate)),
              };
            })
            .filter((row) => row.description && Number.isFinite(row.amount));

          if (rows.length === 0) {
            throw new Error("Geen geldige transacties gevonden in CSV");
          }

          const { error } = await supabase.from("transactions").insert(rows);
if (error) throw error;

// AI inzichten automatisch vernieuwen
await fetch("/api/ai/insights", {
  method: "POST",
});

setMessage(`${rows.length} transacties geïmporteerd`);
        } catch (err: any) {
          setError(err.message ?? "Import mislukt");
        } finally {
          setLoading(false);
        }
      },
      error: (err) => {
        setError(err.message);
        setLoading(false);
      },
    });
  }

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-2xl font-semibold">CSV import</h1>
      <p className="mt-1 text-gray-500">
        Upload banktransacties om abonnementen automatisch te herkennen.
      </p>

      <div className="mt-6 rounded-2xl border bg-white p-4 shadow-sm">
        <label className="block text-sm font-medium text-gray-700">
          Kies CSV-bestand
        </label>

        <input
          type="file"
          accept=".csv"
          className="mt-3 w-full rounded-xl border p-3"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
        />

        <div className="mt-3 text-xs text-gray-500">
          Ondersteunt kolommen zoals: description, amount, transaction_date
        </div>

        {loading && (
          <div className="mt-4 rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
            Importeren...
          </div>
        )}

        {message && (
          <div className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}