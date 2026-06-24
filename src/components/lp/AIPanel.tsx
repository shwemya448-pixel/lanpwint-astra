import { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { askGemini } from "@/lib/ai-gemini.functions";

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
    <div className="lp-card p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <Sparkles className="h-4 w-4 text-[color:var(--gold)] shrink-0" />
        <h3 className="font-bold text-sm sm:text-base">{title}</h3>
        <span className="ml-auto text-[10px] uppercase tracking-[0.2em] text-[color:var(--gold)]">AI · Preview</span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">{hint}</p>
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
