import { useEffect, useRef, useState } from "react";

/**
 * Best-effort deterrent against screenshots & content copying.
 * Shows an INSTANT inline warning banner (no toast queue delay).
 */
export function ScreenshotGuard() {
  const [blurred, setBlurred] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const hideTimer = useRef<number | null>(null);

  useEffect(() => {
    const warn = (msg = "Screenshots are not allowed on this site.") => {
      // Instant — synchronous state update, no animation/queue.
      setWarning(msg);
      setBlurred(true);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => {
        setWarning(null);
        setBlurred(false);
      }, 1400);
    };

    const onContext = (e: MouseEvent) => {
      e.preventDefault();
      warn("Right-click is disabled.");
    };

    const onKey = (e: KeyboardEvent) => {
      const k = e.key?.toLowerCase();
      const meta = e.metaKey || e.ctrlKey;

      if (k === "printscreen" || e.key === "PrintScreen") {
        try { navigator.clipboard.writeText(""); } catch {}
        warn("Screenshots are blocked.");
        e.preventDefault();
        return;
      }
      if (e.shiftKey && (k === "s" || k === "3" || k === "4" || k === "5")) {
        warn("Screenshot shortcut blocked.");
        e.preventDefault();
        return;
      }
      if (k === "f12" || (meta && e.shiftKey && (k === "i" || k === "j" || k === "c")) || (meta && k === "u")) {
        warn("Developer tools are disabled.");
        e.preventDefault();
        return;
      }
      if (meta && (k === "s" || k === "p")) {
        warn("This action is disabled.");
        e.preventDefault();
      }
    };

    const onBlur = () => setBlurred(true);
    const onFocus = () => setBlurred(false);
    const onVis = () => setBlurred(document.visibilityState !== "visible");

    document.addEventListener("contextmenu", onContext);
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("keyup", onKey, true);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("keyup", onKey, true);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, []);

  return (
    <>
      <style>{`
        html, body { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }
        input, textarea, [contenteditable="true"] { -webkit-user-select: text; user-select: text; }
        img, video { -webkit-user-drag: none; user-drag: none; pointer-events: auto; }
        @media print { body { display: none !important; } }
      `}</style>

      {warning && (
        <div
          role="alert"
          data-testid="screenshot-warning"
          className="fixed left-1/2 top-4 z-[10000] -translate-x-1/2 rounded-lg border border-red-500/40 bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-2xl"
        >
          ⚠ {warning}
        </div>
      )}

      {blurred && (
        <div
          aria-hidden
          data-testid="screenshot-overlay"
          className="fixed inset-0 z-[9999] grid place-items-center bg-black/90 text-center text-white backdrop-blur-xl"
        >
          <div className="px-6">
            <div className="font-serif text-2xl text-[color:var(--gold)]">Content Protected</div>
            <p className="mt-2 text-sm text-white/80">Screenshots and screen recording are not allowed.</p>
          </div>
        </div>
      )}
    </>
  );
}
