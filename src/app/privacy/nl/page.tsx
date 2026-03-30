import Link from "next/link";

export default function PrivacyPageNL() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-gray-500">SubBye</div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-950">
              Privacybeleid
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Laatst bijgewerkt: 2026
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 p-1">
            <Link
              href="/privacy"
              className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-white"
            >
              English
            </Link>
            <Link
              href="/privacy/nl"
              className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white"
            >
              Nederlands
            </Link>
          </div>
        </div>

        <div className="mt-8 space-y-8 text-gray-700">
          <section>
            <p className="text-base leading-7">
              SubBye helpt je inzicht te krijgen in je abonnementen en uitgaven.
              We nemen je privacy serieus.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-950">
              Welke data we verzamelen
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 leading-7">
              <li>Accountgegevens, zoals je e-mailadres</li>
              <li>Abonnementen die je toevoegt in de app</li>
              <li>Transacties die je importeert</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-950">
              Hoe we je data gebruiken
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 leading-7">
              <li>Om je abonnementen te tonen en beheren</li>
              <li>Om inzichten en bespaarsuggesties te genereren</li>
              <li>Om de app te verbeteren</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-950">AI gebruik</h2>
            <p className="mt-3 leading-7">
              We gebruiken AI om inzichten te genereren. Je data wordt alleen
              gebruikt om persoonlijk advies te geven en je ervaring in de app te
              verbeteren.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-950">
              Delen van data
            </h2>
            <p className="mt-3 leading-7">
              We verkopen je data niet. We delen alleen data met noodzakelijke
              dienstverleners, zoals betalingsproviders, hostingproviders en
              AI-diensten, wanneer dat nodig is om de app te laten werken.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-950">Contact</h2>
            <p className="mt-3 leading-7">
              Vragen over dit privacybeleid?
              <br />
              Email: support@subbye.app
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}