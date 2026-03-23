"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const pathname = usePathname();

  function navClass(path: string) {
    return `flex flex-col items-center text-xs ${
      pathname === path ? "text-black font-semibold" : "text-gray-500"
    }`;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-white">
      <div className="mx-auto flex max-w-md justify-around py-2">
        <Link href="/dashboard" className={navClass("/dashboard")}>
          <span className="text-lg">🏠</span>
          Dashboard
        </Link>

        <Link href="/add" className={navClass("/add")}>
          <span className="text-lg">➕</span>
          Add
        </Link>

        <Link href="/import" className={navClass("/import")}>
          <span className="text-lg">⬆</span>
          Import
        </Link>

        <Link href="/settings" className={navClass("/settings")}>
          <span className="text-lg">⚙</span>
          Settings
        </Link>
      </div>
    </nav>
  );
}