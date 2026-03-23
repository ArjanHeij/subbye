import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="mx-auto max-w-md px-4 pb-10 pt-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold tracking-tight">SubBye</div>
            <div className="text-xs text-gray-500">
              Stop met geld verliezen aan vergeten abonnementen
            </div>
          </div>

          <Link
            href="/login"
            className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white shadow-sm"
          >
            Inloggen
          </Link>
        </div>

        <div className="mt-10">
          <div className="inline-flex rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm">
            Slim abonnementen beheren
          </div>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-gray-950">
            Krijg inzicht, bespaar geld en zeg abonnementen sneller op.
          </h1>

          <p className="mt-4 text-base leading-7 text-gray-600">
            SubBye helpt je om abonnementen te beheren, kosten te begrijpen,
            dubbele diensten te ontdekken en met AI sneller actie te nemen.
          </p>

          <div className="mt-6 flex gap-3">
            <Link
              href="/login"
              className="rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white shadow-sm"
            >
              Start gratis
            </Link>

            <Link
              href="/premium"
              className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-900 shadow-sm"
            >
              Bekijk Premium
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Voorbeeld dashboard
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Zo voelt SubBye op mobiel
              </div>
            </div>

            <div className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
              ⭐ Premium
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-black p-4 text-white">
              <div className="text-xs uppercase tracking-wide text-white/70">
                Totale kosten
              </div>
              <div className="mt-2 text-2xl font-semibold">€64,97</div>
              <div className="mt-1 text-xs text-white/70">≈ €779,64 / jaar</div>
            </div>

            <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
              <div className="text-xs uppercase tracking-wide text-green-700">
                Mogelijke besparing
              </div>
              <div className="mt-2 text-2xl font-semibold text-green-700">
                €24,99
              </div>
              <div className="mt-1 text-xs text-green-700/80">per maand</div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-gray-50 p-4">
            <div className="text-sm font-semibold text-gray-900">
              💡 Bespaar inzichten
            </div>
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
                • Je hebt meerdere streamingdiensten tegelijk
              </div>
              <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
                • Basic-Fit is één van je duurste abonnementen
              </div>
              <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
                • Je kunt ongeveer €300 per jaar besparen
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-gray-900">
              Waarom SubBye
            </div>

            <div className="mt-4 space-y-4 text-sm text-gray-600">
              <div>
                <div className="font-medium text-gray-900">
                  1. Voeg abonnementen toe of importeer transacties
                </div>
                <div className="mt-1">
                  Begin handmatig of gebruik CSV import om sneller inzicht te
                  krijgen.
                </div>
              </div>

              <div>
                <div className="font-medium text-gray-900">
                  2. Zie direct waar je geld naartoe gaat
                </div>
                <div className="mt-1">
                  Krijg overzicht van je maandlasten, duurste diensten en
                  mogelijke overlap.
                </div>
              </div>

              <div>
                <div className="font-medium text-gray-900">
                  3. Gebruik AI om slimmer te besparen
                </div>
                <div className="mt-1">
                  Ontvang inzichten, detecteer abonnementen en laat AI helpen
                  bij opzeggen.
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-gray-900">
              Wat je krijgt met Premium
            </div>

            <div className="mt-4 grid gap-3 text-sm text-gray-700">
              <div className="rounded-2xl bg-gray-50 px-4 py-3">
                ✅ Onbeperkt abonnementen toevoegen
              </div>
              <div className="rounded-2xl bg-gray-50 px-4 py-3">
                🤖 AI bespaar inzichten
              </div>
              <div className="rounded-2xl bg-gray-50 px-4 py-3">
                🔎 Slimmere detectie uit transacties
              </div>
              <div className="rounded-2xl bg-gray-50 px-4 py-3">
                💌 AI hulp bij opzeggen
              </div>
            </div>

            <Link
              href="/premium"
              className="mt-5 block rounded-2xl bg-black py-3 text-center text-sm font-medium text-white shadow-sm"
            >
              Upgrade naar Premium
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-5 text-center shadow-sm">
          <div className="text-lg font-semibold text-gray-900">
            Klaar om grip te krijgen op je abonnementen?
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Start gratis en ontdek direct waar je kunt besparen.
          </p>

          <div className="mt-5 flex flex-col gap-3">
            <Link
              href="/login"
              className="rounded-2xl bg-black py-3 text-sm font-medium text-white shadow-sm"
            >
              Start gratis
            </Link>

            <Link
              href="/contact"
              className="rounded-2xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-900"
            >
              Contact
            </Link>
          </div>
        </div>

        <footer className="mt-10 pb-6 text-center text-xs text-gray-400">
          <div className="flex justify-center gap-6">
            <Link href="/privacy" className="hover:text-black">
              Privacy
            </Link>
            <Link href="/contact" className="hover:text-black">
              Contact
            </Link>
          </div>

          <div className="mt-3">© {new Date().getFullYear()} SubBye</div>
        </footer>
      </section>
    </main>
  );
}