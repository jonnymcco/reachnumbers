"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthModalProvider } from "@/components/AuthModalContext";
import { AuthModal } from "@/components/AuthModal";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <AuthModalProvider>
          {children}
          <AuthModal />
        </AuthModalProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
