import { useEffect, useState } from "react";
import { toast } from "sonner";

/**
 * Best-effort deterrent against screenshots & content copying.
 * Note: No web app can truly block OS-level screenshots, but this
 * disables common capture paths and warns the user.
 */
export function ScreenshotGuard() {
  const [blurred, setBlurred] = useState(false);

  useEffect(() => {
    const warn = (msg = "Screenshots are not allowed on this site.") => {
      toast.warning(msg, { duration: 2500 });
      setBlurred(true);
      window.setTimeout(() => setBlurred(false), 1500);
    };

    // Disable right-click
    const onContext = (e: MouseEvent) => {
      e.preventDefault();
      warn("Right-click is disabled.");
    };

    // Block common screenshot / devtools / copy shortcuts
    const onKey = (e: KeyboardEvent) => {
      const k = e.key?.toLowerCase();
      const meta = e.metaKey || e.ctrlKey;

      // PrintScreen
      if (k === "printscreen" || e.key === "PrintScreen") {
        try { navigator.clipboard.writeText(""); } catch {}
        warn("Screenshots are blocked.");
        e.preventDefault();
        return;
      }
      // Win+Shift+S / Cmd+Shift+3/4/5 / Ctrl+Shift+S
      if (e.shiftKey && (k === "s" || k === "3" || k === "4" || k === "5")) {
        warn("Screenshot shortcut blocked.");
        e.preventDefault();
        return;
      }
      // DevTools: F12, Ctrl/Cmd+Shift+I/J/C, Ctrl/Cmd+U (view source)
      if (k === "f12" || (meta && e.shiftKey && (k === "i" || k === "j" || k === "c")) || (meta && k === "u")) {
        warn("Developer tools are disabled.");
        e.preventDefault();
        return;
      }
      // Copy / Save
      if (meta && (k === "s" || k === "p")) {
        warn("This action is disabled.");
        e.preventDefault();
      }
    };

    // Blur when tab loses focus (mitigates capture tools)
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
      {blurred && (
        <div
          aria-hidden
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
