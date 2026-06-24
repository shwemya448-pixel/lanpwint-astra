import { useEffect, useRef } from "react";
import { useLocale } from "@/lib/i18n";
import { askGemini } from "@/lib/ai-gemini.functions";

const CACHE_KEY = "lp-translation-cache-my";
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA", "INPUT"]);
const ORIGINAL_ATTR = "data-lp-original";

function loadCache(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}
function saveCache(c: Record<string, string>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(c));
  } catch {
    /* quota */
  }
}

function collectTextNodes(root: Node): Text[] {
  const out: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const t = node.nodeValue?.trim();
      if (!t || t.length < 2) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (!parent || SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (parent.closest("[data-lp-skip]")) return NodeFilter.FILTER_REJECT;
      // Skip if already translated (text contains only burmese chars likely)
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let n: Node | null;
  while ((n = walker.nextNode())) out.push(n as Text);
  return out;
}

// Map text node -> original text
const originals = new WeakMap<Text, string>();

async function translateBatch(texts: string[]): Promise<string[]> {
  const system =
    "You are a professional translator. Translate the given JSON array of UI strings from English to Burmese (Myanmar). Preserve numbers, punctuation, emojis, and brand names like 'Lan Pwint'. Return ONLY a valid JSON array of strings in the same order, no markdown, no commentary.";
  const prompt = JSON.stringify(texts);
  const res = await askGemini({ data: { system, prompt } });
  let content = res.content.trim();
  // Strip code fences if any
  content = content.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length === texts.length) return parsed.map(String);
  } catch {
    /* fall through */
  }
  return texts;
}

export function AutoTranslator() {
  const { lang } = useLocale();
  const cacheRef = useRef<Record<string, string>>({});
  const inFlightRef = useRef(false);
  const pendingRef = useRef(false);

  useEffect(() => {
    cacheRef.current = loadCache();
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    function restore() {
      document.querySelectorAll(`[${ORIGINAL_ATTR}]`).forEach((el) => {
        const orig = el.getAttribute(ORIGINAL_ATTR);
        if (orig !== null) {
          // Restore text nodes by re-collecting from stored originals
        }
        el.removeAttribute(ORIGINAL_ATTR);
      });
      // Reload page to fully restore (simpler & reliable)
    }

    async function translatePage() {
      if (inFlightRef.current) {
        pendingRef.current = true;
        return;
      }
      inFlightRef.current = true;
      try {
        const nodes = collectTextNodes(document.body);
        const cache = cacheRef.current;
        const toTranslate: { node: Text; text: string }[] = [];

        for (const node of nodes) {
          const original = originals.get(node) ?? node.nodeValue ?? "";
          if (!originals.has(node)) originals.set(node, original);
          const key = original.trim();
          if (!key) continue;
          const cached = cache[key];
          if (cached) {
            if (node.nodeValue !== cached) node.nodeValue = node.nodeValue!.replace(key, cached);
          } else {
            toTranslate.push({ node, text: key });
          }
        }

        // Batch translate (chunks of 30)
        const CHUNK = 30;
        for (let i = 0; i < toTranslate.length; i += CHUNK) {
          const chunk = toTranslate.slice(i, i + CHUNK);
          const uniqueTexts = Array.from(new Set(chunk.map((c) => c.text)));
          try {
            const translated = await translateBatch(uniqueTexts);
            const map: Record<string, string> = {};
            uniqueTexts.forEach((t, idx) => (map[t] = translated[idx]));
            for (const { node, text } of chunk) {
              const tr = map[text];
              if (tr && node.nodeValue) {
                cache[text] = tr;
                node.nodeValue = node.nodeValue.replace(text, tr);
              }
            }
            saveCache(cache);
          } catch (e) {
            console.warn("translate batch failed", e);
            break;
          }
        }
      } finally {
        inFlightRef.current = false;
        if (pendingRef.current) {
          pendingRef.current = false;
          setTimeout(translatePage, 300);
        }
      }
    }

    if (lang === "my") {
      let obs: MutationObserver | null = null;
      const wrapped = async () => {
        obs?.disconnect();
        try { await translatePage(); } finally {
          obs?.observe(document.body, { childList: true, subtree: true });
        }
      };
      wrapped();
      obs = new MutationObserver(() => {
        clearTimeout((window as any).__lpTrTimer);
        (window as any).__lpTrTimer = setTimeout(wrapped, 1200);
      });
      obs.observe(document.body, { childList: true, subtree: true });
      return () => obs?.disconnect();
    }
  }, [lang]);

  return null;
}
