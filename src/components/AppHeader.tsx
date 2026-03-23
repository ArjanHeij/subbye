export default function AppHeader() {
  return (
    <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <div>
          <div className="text-base font-semibold text-gray-900">SubBye</div>
          <div className="text-xs text-gray-500">
            Stop met geld verliezen aan vergeten abonnementen
          </div>
        </div>

        <div className="rounded-xl bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm">
          SB
        </div>
      </div>
    </header>
  );
}