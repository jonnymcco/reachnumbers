"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useAuthModal } from "./AuthModalContext";
import { CloseIcon } from "./icons";

type Tab = "login" | "signup";

export function AuthModal() {
  const { isOpen, reason, closeModal } = useAuthModal();
  const [tab, setTab] = useState<Tab>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const reset = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError(null);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    closeModal();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (tab === "signup") {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Something went wrong.");
          setLoading(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      handleClose();
      window.location.reload();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-surface border border-border shadow-2xl p-6 animate-[fadeIn_0.15s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {tab === "signup" ? "Create your account" : "Welcome back"}
            </h2>
            {reason && <p className="text-sm text-foreground-muted mt-1">{reason}</p>}
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="text-foreground-muted hover:text-foreground cursor-pointer"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-1 mb-4 rounded-lg bg-surface-muted p-1">
          {(["signup", "login"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                setError(null);
              }}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                tab === t
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              {t === "signup" ? "Sign up" : "Log in"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {tab === "signup" && (
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Name</label>
              <input
                required
                maxLength={50}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                placeholder="Ada Lovelace"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1">Password</label>
            <input
              required
              type="password"
              minLength={tab === "signup" ? 8 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent text-accent-foreground font-medium py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Please wait…" : tab === "signup" ? "Create account" : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}
