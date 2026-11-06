"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Profile } from "@/lib/db/schema";
import { MemberProfileForm } from "@/components/MemberProfileForm";

export function MemberProfileEditor({ initial }: { initial: Profile }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  return (
    <div className="grid gap-4">
      {saved ? (
        <p className="rounded-2xl border border-lime/30 bg-lime/10 px-4 py-3 text-sm text-lime">
          Ficha actualizada. La IA y tu coach usarán estos datos.
        </p>
      ) : null}
      <MemberProfileForm
        initial={initial}
        submitLabel="Guardar cambios"
        onSuccess={() => {
          setSaved(true);
          router.refresh();
        }}
      />
    </div>
  );
}
