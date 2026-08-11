"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

interface AuthModalState {
  isOpen: boolean;
  reason: string | null;
  openModal: (reason?: string) => void;
  closeModal: () => void;
}

const AuthModalContext = createContext<AuthModalState | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<string | null>(null);

  const openModal = useCallback((r?: string) => {
    setReason(r ?? null);
    setIsOpen(true);
  }, []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ isOpen, reason, openModal, closeModal }),
    [isOpen, reason, openModal, closeModal],
  );

  return <AuthModalContext.Provider value={value}>{children}</AuthModalContext.Provider>;
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}
