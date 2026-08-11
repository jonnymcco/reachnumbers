import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto max-w-4xl px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight text-foreground">
          Reach<span className="text-accent">.</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
