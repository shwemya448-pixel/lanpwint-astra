import { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { askGemini } from "@/lib/ai-gemini.functions";
import compassSprite from "@/assets/compass-sprite.png";

export function AIPanel({
  title,
  hint,
  placeholder,
  system,
}: {
  title: string;
  hint: string;
  placeholder: string;
  system: string;
}) {
  const ask = useServerFn(askGemini);
  const [input, setInput] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    setLoading(true);
    setReply(null);
    setError(null);
    try {
      const { content } = await ask({ data: { system, prompt: input.trim() } });
      setReply(content || "No response.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp-card lp-tilt p-4 sm:p-6 relative overflow-hidden">
      <div className="lp-sheen" aria-hidden />
      <div className="flex items-center gap-3 mb-1 flex-wrap">
        <img
          src={compassSprite}
          alt=""
          width={44}
          height={44}
          loading="lazy"
          className="h-11 w-11 lp-float drop-shadow-[0_4px_12px_color-mix(in_oklab,var(--gold)_55%,transparent)] shrink-0"
        />
        <div className="flex flex-col">
          <h3 className="font-serif text-lg sm:text-xl leading-tight">{title}</h3>
          <span className="text-[10px] uppercase tracking-[0.25em] lp-shimmer-text font-semibold">Pwint · AI Companion</span>
        </div>
        <Sparkles className="ml-auto h-4 w-4 text-[color:var(--gold)] shrink-0" />
      </div>
      <p className="text-xs text-muted-foreground mb-4 mt-2">{hint}</p>
      <form onSubmit={send} className="flex flex-col sm:flex-row gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-w-0 h-11 px-4 rounded-xl lp-glass bg-transparent text-sm outline-none focus:ring-2 focus:ring-[color:var(--gold)]/60"
        />
        <button
          type="submit"
          disabled={loading}
          className="lp-gold-btn h-11 px-5 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60 shrink-0"
        >
          <Send className="h-4 w-4" />
          {loading ? "Thinking…" : "Ask"}
        </button>
      </form>
      {reply && (
        <div className="mt-4 p-4 rounded-xl lp-glass text-sm leading-relaxed whitespace-pre-line">{reply}</div>
      )}
      {error && (
        <div className="mt-4 p-3 rounded-xl border border-red-500/40 bg-red-500/10 text-xs text-red-200">{error}</div>
      )}
      <p className="mt-3 text-[10px] text-muted-foreground/70">Powered by Lovable AI · Gemini</p>
    </div>
  );
}
