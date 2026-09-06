"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="border-b bg-white dark:bg-slate-900 dark:border-slate-700">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-brand-600 dark:text-brand-400">
          ResumeIQ
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/pricing" className="hover:text-brand-600 dark:hover:text-brand-400">Pricing</Link>
          {session ? (
            <>
              <Link href="/dashboard" className="hover:text-brand-600 dark:hover:text-brand-400">Dashboard</Link>
              <ThemeToggle />
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-brand-600 dark:hover:text-brand-400">Log in</Link>
              <Link
                href="/register"
                className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

