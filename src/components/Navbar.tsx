"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuthModal } from "./AuthModalContext";
import { MenuIcon, CloseIcon, CalendarIcon, TrophyIcon, DiceIcon, UserIcon } from "./icons";

const LINKS = [
  { href: "/", label: "Just Play!", icon: DiceIcon },
  { href: "/daily", label: "Daily Puzzle", icon: CalendarIcon },
  { href: "/leaderboard", label: "Leaderboard", icon: TrophyIcon },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const { openModal } = useAuthModal();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto max-w-4xl px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
            className="h-9 w-9 flex items-center justify-center rounded-full text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
          >
            {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
          <Link href="/" className="font-bold text-lg tracking-tight text-foreground">
            Reach<span className="text-accent">.</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {status === "authenticated" ? (
            <button
              type="button"
              onClick={() => signOut()}
              className="hidden sm:inline-flex text-sm font-medium rounded-full border border-border px-3 py-1.5 text-foreground-muted hover:text-foreground hover:border-accent transition-colors cursor-pointer"
            >
              Log out
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openModal()}
              className="text-sm font-medium rounded-full bg-accent text-accent-foreground px-3.5 py-1.5 hover:opacity-90 transition-opacity cursor-pointer"
            >
              Sign up / Log in
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-surface">
          <nav className="mx-auto max-w-4xl px-4 py-3 flex flex-col gap-1">
            {LINKS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-surface-muted text-foreground"
                      : "text-foreground-muted hover:bg-surface-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {label}
                </Link>
              );
            })}
            <div className="mt-2 pt-2 border-t border-border flex items-center justify-between px-3">
              {status === "authenticated" ? (
                <>
                  <span className="flex items-center gap-2 text-sm text-foreground-muted truncate">
                    <UserIcon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{session.user?.name ?? session.user?.email}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="sm:hidden text-sm font-medium text-danger cursor-pointer"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <span className="text-sm text-foreground-muted">Playing as guest</span>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
