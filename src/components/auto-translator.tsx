import { useCallback, useEffect, useRef } from "react";
import { useLocale } from "@/lib/i18n";
import { askGemini } from "@/lib/ai-gemini.functions";

const CACHE_KEY = "lp-translation-cache-my";
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA", "INPUT"]);
const MAX_TEXT_LENGTH = 180;

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
      if (t.length > MAX_TEXT_LENGTH) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (!parent || SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (parent.closest("[data-lp-skip]")) return NodeFilter.FILTER_REJECT;
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
  const translatedNodesRef = useRef<Set<Text>>(new Set());
  const observerRef = useRef<MutationObserver | null>(null);
  const timerRef = useRef<number | null>(null);
  const runIdRef = useRef(0);

  useEffect(() => {
    cacheRef.current = loadCache();
  }, []);

  const restoreEnglish = useCallback(() => {
    runIdRef.current += 1;
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    translatedNodesRef.current.forEach((node) => {
      const original = originals.get(node);
      if (original !== undefined && node.isConnected) node.nodeValue = original;
    });
    translatedNodesRef.current.clear();
    inFlightRef.current = false;
    pendingRef.current = false;
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    if (lang !== "my") {
      restoreEnglish();
      return;
    }

    async function translatePage() {
      if (lang !== "my") return;
      const runId = runIdRef.current;
      if (inFlightRef.current) {
        pendingRef.current = true;
        return;
      }
      inFlightRef.current = true;
      try {
        const nodes = collectTextNodes(document.body).filter((node) => !translatedNodesRef.current.has(node));
        const cache = cacheRef.current;
        const toTranslate: { node: Text; text: string }[] = [];

        for (const node of nodes) {
          const original = node.nodeValue ?? "";
          if (!originals.has(node)) originals.set(node, original);
          const key = original.trim();
          if (!key) continue;
          const cached = cache[key];
          if (cached) {
            if (node.nodeValue !== cached) {
              if (runId !== runIdRef.current) return;
              node.nodeValue = original.replace(key, cached);
              translatedNodesRef.current.add(node);
            }
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
            if (runId !== runIdRef.current) return;
            const map: Record<string, string> = {};
            uniqueTexts.forEach((t, idx) => (map[t] = translated[idx]));
            for (const { node, text } of chunk) {
              const tr = map[text];
              if (tr && node.nodeValue) {
                cache[text] = tr;
                const original = originals.get(node) ?? node.nodeValue;
                node.nodeValue = original.replace(text, tr);
                translatedNodesRef.current.add(node);
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
        if (pendingRef.current && lang === "my" && runId === runIdRef.current) {
          pendingRef.current = false;
          setTimeout(translatePage, 300);
        }
      }
    }

    const wrapped = async () => {
      observerRef.current?.disconnect();
      try {
        await translatePage();
      } finally {
        observerRef.current?.observe(document.body, { childList: true, subtree: true });
      }
    };

    wrapped();
    observerRef.current = new MutationObserver((mutations) => {
      if (!mutations.some((m) => m.addedNodes.length > 0 || m.removedNodes.length > 0)) return;
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(wrapped, 1800);
    });
    observerRef.current.observe(document.body, { childList: true, subtree: true });

    return restoreEnglish;
  }, [lang, restoreEnglish]);

  return null;
}
