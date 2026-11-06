"use client";

import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { isClerkConfigured } from "@/lib/clerk";

export function Providers({ children }: { children: ReactNode }) {
  if (!isClerkConfigured()) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/registro"
      afterSignOutUrl="/"
    >
      {children}
    </ClerkProvider>
  );
}
