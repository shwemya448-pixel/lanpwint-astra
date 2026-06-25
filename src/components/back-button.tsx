import { useRouter, useRouterState } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

/**
 * Floating "Go back" button. Hidden on the home page.
 * Uses router history when available, falls back to navigating home.
 */
export function BackButton() {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (pathname === "/" || pathname === "") return null;

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
    } else {
      router.navigate({ to: "/" });
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={goBack}
        className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur transition-all hover:-translate-x-0.5 hover:border-[color:var(--gold)]/60 hover:text-foreground"
        aria-label="Go back"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
        Go back
      </button>
    </div>
  );
}
