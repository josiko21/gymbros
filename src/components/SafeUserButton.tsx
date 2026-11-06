"use client";

import { UserButton } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/clerk";

export function SafeUserButton() {
  if (!isClerkConfigured()) {
    return (
      <span className="rounded-full border border-paper/20 px-3 py-1.5 text-xs text-muted">
        Sin sesión
      </span>
    );
  }

  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: "h-9 w-9 ring-1 ring-paper/20",
        },
      }}
    />
  );
}
