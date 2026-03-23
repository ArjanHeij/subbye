export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-md p-4">

      <h1 className="text-2xl font-semibold">
        🔒 Privacybeleid
      </h1>

      <p className="mt-2 text-sm text-gray-500">
        Laatst bijgewerkt: vandaag
      </p>

      <div className="mt-6 space-y-4 text-sm text-gray-700">

        <p>
          SubBye helpt je om inzicht te krijgen in je abonnementen en geld te besparen.
          We nemen jouw privacy serieus.
        </p>

        <h2 className="font-semibold">Welke data we verzamelen</h2>
        <ul className="list-disc pl-5">
          <li>Accountgegevens (zoals e-mail)</li>
          <li>Abonnementen die je toevoegt</li>
          <li>Transacties die je importeert</li>
        </ul>

        <h2 className="font-semibold">Hoe we je data gebruiken</h2>
        <ul className="list-disc pl-5">
          <li>Om je abonnementen te tonen</li>
          <li>Om inzichten en bespaartips te genereren</li>
          <li>Om de app te verbeteren</li>
        </ul>

        <h2 className="font-semibold">AI gebruik</h2>
        <p>
          We gebruiken AI om inzichten te genereren. Je data wordt alleen gebruikt
          om jou persoonlijk advies te geven.
        </p>

        <h2 className="font-semibold">Delen van data</h2>
        <p>
          We verkopen je data niet. We delen alleen data met noodzakelijke diensten
          zoals betalingsproviders en AI-diensten.
        </p>

        <h2 className="font-semibold">Contact</h2>
        <p>
          Vragen? Neem contact op via de contactpagina.
        </p>

      </div>

    </main>
  );
}