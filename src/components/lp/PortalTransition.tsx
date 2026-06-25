import { useEffect } from "react";
import type { PortalKind } from "./PortalCard";

const LABEL: Record<PortalKind, string> = {
  student: "Students",
  candidate: "Candidate",
};

export function PortalTransition({ portal, onDone }: { portal: PortalKind; onDone: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDone, 2000);
    return () => clearTimeout(id);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden" style={{ perspective: "1400px" }}>
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[60vmin] w-[60vmin] rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--gold) 90%, white) 0%, color-mix(in oklab, var(--gold) 50%, transparent) 35%, transparent 70%)",
          filter: "blur(8px)",
          animation: "lp-light-burst 1.8s ease-out forwards",
        }}
      />
      <div
        className="absolute top-0 left-0 h-full w-1/2 origin-left"
        style={{
          background: "linear-gradient(135deg, oklch(0.18 0.05 265) 0%, oklch(0.28 0.06 265) 60%, oklch(0.22 0.05 265) 100%)",
          borderRight: "2px solid color-mix(in oklab, var(--gold) 60%, transparent)",
          boxShadow: "inset -20px 0 60px -20px color-mix(in oklab, var(--gold) 50%, transparent)",
          animation: "lp-door-left 1.6s cubic-bezier(.7,.02,.27,1) forwards",
        }}
      />
      <div
        className="absolute top-0 right-0 h-full w-1/2 origin-right"
        style={{
          background: "linear-gradient(225deg, oklch(0.18 0.05 265) 0%, oklch(0.28 0.06 265) 60%, oklch(0.22 0.05 265) 100%)",
          borderLeft: "2px solid color-mix(in oklab, var(--gold) 60%, transparent)",
          boxShadow: "inset 20px 0 60px -20px color-mix(in oklab, var(--gold) 50%, transparent)",
          animation: "lp-door-right 1.6s cubic-bezier(.7,.02,.27,1) forwards",
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="lp-animate-in text-center">
          <div className="text-xs uppercase tracking-[0.4em] text-[color:var(--gold)] mb-3">Welcome</div>
          <div className="text-3xl sm:text-5xl font-bold lp-shimmer-text">{LABEL[portal]}</div>
          <div className="mt-4 text-sm text-[color:var(--foreground)]/80">Opening your gateway…</div>
        </div>
      </div>
    </div>
  );
}
