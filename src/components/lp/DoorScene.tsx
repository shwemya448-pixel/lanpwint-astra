import { useState } from "react";

export function DoorScene() {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="lp-card relative aspect-square w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto p-4 sm:p-6 flex flex-col items-center justify-end select-none cursor-pointer group"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((v) => !v)}
      role="button"
      aria-label="Open the door"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl opacity-60">
        {Array.from({ length: 28 }).map((_, i) => (
          <span
            key={i}
            className="absolute h-[2px] w-[2px] rounded-full bg-[color:var(--gold)]"
            style={{ top: `${(i * 53) % 100}%`, left: `${(i * 37) % 100}%`, opacity: 0.4 + ((i * 13) % 60) / 100 }}
          />
        ))}
      </div>

      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[58%] rounded-full transition-all duration-700 ease-out"
        style={{
          width: open ? "320px" : "120px",
          height: open ? "320px" : "120px",
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--gold) 75%, transparent) 0%, color-mix(in oklab, var(--gold) 25%, transparent) 35%, transparent 70%)",
          filter: open ? "blur(8px)" : "blur(14px)",
          opacity: open ? 1 : 0.55,
        }}
      />

      <div className="relative mb-12" style={{ perspective: "900px" }}>
        <div
          className="relative rounded-t-[60px] border-2"
          style={{
            width: "140px",
            height: "210px",
            borderColor: "color-mix(in oklab, var(--gold) 70%, transparent)",
            background: "linear-gradient(180deg, color-mix(in oklab, var(--royal) 60%, #000) 0%, color-mix(in oklab, var(--royal) 30%, #000) 100%)",
            boxShadow: open
              ? "0 0 60px 8px color-mix(in oklab, var(--gold) 60%, transparent), inset 0 0 40px color-mix(in oklab, var(--gold) 30%, transparent)"
              : "0 0 24px 2px color-mix(in oklab, var(--gold) 25%, transparent)",
            transition: "box-shadow 700ms ease",
            overflow: "hidden",
          }}
        >
          <div
            className="absolute inset-0 rounded-t-[60px]"
            style={{
              background:
                "radial-gradient(ellipse at center 60%, #fff 0%, color-mix(in oklab, var(--gold) 80%, #fff) 35%, color-mix(in oklab, var(--gold) 60%, transparent) 70%, transparent 100%)",
              opacity: open ? 1 : 0,
              transition: "opacity 600ms ease 150ms",
            }}
          />
          <div
            className="absolute inset-0 rounded-t-[60px]"
            style={{
              transformOrigin: "left center",
              transform: open ? "rotateY(-72deg)" : "rotateY(0deg)",
              transition: "transform 900ms cubic-bezier(.6,.05,.2,1)",
              background: "linear-gradient(180deg, color-mix(in oklab, var(--royal) 85%, #000) 0%, color-mix(in oklab, var(--royal) 55%, #000) 100%)",
              border: "2px solid color-mix(in oklab, var(--gold) 60%, transparent)",
              boxShadow: "inset 0 0 30px rgba(0,0,0,.5)",
            }}
          >
            <div className="absolute inset-3 rounded-t-[48px] border" style={{ borderColor: "color-mix(in oklab, var(--gold) 35%, transparent)" }} />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full"
              style={{ background: "var(--gold)", boxShadow: "0 0 10px var(--gold)" }}
            />
          </div>
        </div>
        <div className="mt-1 flex flex-col items-center">
          {[100, 124, 150, 178].map((w, i) => (
            <div
              key={i}
              className="h-[10px] border-t"
              style={{
                width: `${w}px`,
                background: "linear-gradient(180deg, color-mix(in oklab, var(--royal) 70%, #000), color-mix(in oklab, var(--royal) 40%, #000))",
                borderColor: "color-mix(in oklab, var(--gold) 30%, transparent)",
                boxShadow: open ? `0 0 ${14 - i * 2}px color-mix(in oklab, var(--gold) 50%, transparent)` : "none",
                transition: "box-shadow 500ms ease",
              }}
            />
          ))}
        </div>
      </div>

      <p className="relative text-xs tracking-wide text-muted-foreground">
        {open ? "✨ The path is revealed." : "Hover over the platform to reveal the path."}
      </p>
    </div>
  );
}
