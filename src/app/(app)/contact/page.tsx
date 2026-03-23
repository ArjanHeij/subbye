export default function ContactPage() {
  return (
    <main className="mx-auto max-w-md p-4">

      <h1 className="text-2xl font-semibold">
        📩 Contact
      </h1>

      <p className="mt-2 text-sm text-gray-500">
        Heb je vragen of feedback? Laat het ons weten.
      </p>

      <div className="mt-6 space-y-4 text-sm text-gray-700">

        <p>
          We helpen je graag met:
        </p>

        <ul className="list-disc pl-5">
          <li>Vragen over abonnementen</li>
          <li>Problemen met betalingen</li>
          <li>Feedback of ideeën</li>
        </ul>

        <div className="mt-4 rounded-xl border p-4">

          <p className="font-medium">E-mail</p>
          <p className="text-gray-600">support@subbye.app</p>

        </div>

      </div>

    </main>
  );
}