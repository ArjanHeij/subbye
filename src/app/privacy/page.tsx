import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-gray-500">SubBye</div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-950">
              Privacy Policy
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Last updated: 2026
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 p-1">
            <Link
              href="/privacy"
              className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white"
            >
              English
            </Link>
            <Link
              href="/privacy/nl"
              className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-white"
            >
              Nederlands
            </Link>
          </div>
        </div>

        <div className="mt-8 space-y-8 text-gray-700">
          <section>
            <p className="text-base leading-7">
              SubBye helps you gain insight into your subscriptions and spending.
              We take your privacy seriously.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-950">
              Data we collect
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 leading-7">
              <li>Account data, such as your email address</li>
              <li>Subscriptions you add to the app</li>
              <li>Transaction data you import</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-950">
              How we use your data
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 leading-7">
              <li>To display and manage your subscriptions</li>
              <li>To generate insights and savings suggestions</li>
              <li>To improve the app experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-950">AI usage</h2>
            <p className="mt-3 leading-7">
              We use AI to generate insights. Your data is only used to provide
              personalized advice and improve your experience inside the app.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-950">Data sharing</h2>
            <p className="mt-3 leading-7">
              We do not sell your data. We only share data with necessary service
              providers such as payment providers, hosting providers, and AI
              services when needed to operate the app.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-950">Contact</h2>
            <p className="mt-3 leading-7">
              Questions about this privacy policy?
              <br />
              Email: support@subbye.app
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}