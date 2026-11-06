import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { ClerkMissing } from "@/components/ClerkMissing";
import { isClerkConfigured } from "@/lib/clerk";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  if (!isClerkConfigured()) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink px-5 py-16">
        <ClerkMissing intent="sign-in" />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-ink px-5 py-16">
      <p className="text-center text-sm text-muted">
        Entra en Gymbros ·{" "}
        <Link href="/registro" className="text-lime hover:underline">
          Crear cuenta
        </Link>
      </p>
      <SignIn
        forceRedirectUrl="/post-auth"
        signUpUrl="/registro"
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-ink-soft border border-paper/10 shadow-none",
          },
        }}
      />
    </main>
  );
}
