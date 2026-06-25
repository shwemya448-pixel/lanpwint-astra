import { useState } from "react";
import { Link } from "@tanstack/react-router";
import compassSprite from "@/assets/compass-sprite.png";

/**
 * Floating cute compass-sprite mascot that lives in the bottom-right corner.
 * Click to open the AI assistant. Hover for a friendly speech bubble.
 */
export function BotMascot() {
  const [hover, setHover] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-40 pointer-events-none select-none">
      <div className="relative pointer-events-auto">
        {hover && (
          <div
            className="absolute bottom-full right-0 mb-2 w-48 lp-glass rounded-2xl px-3 py-2 text-xs font-medium animate-[lp-fade-up_.3s_ease-out]"
            data-lp-skip
          >
            <span className="lp-shimmer-text font-semibold">Hi, I'm Pwint!</span>
            <br />
            Ask me anything about your career.
            <span className="absolute -bottom-1 right-6 h-3 w-3 rotate-45 lp-glass border-r border-b" />
          </div>
        )}
        <Link
          to="/find-passion"
          aria-label="Open AI career assistant"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className="block group"
        >
          <span className="absolute inset-0 -m-3 rounded-full bg-[color:var(--gold)]/30 blur-2xl opacity-60 group-hover:opacity-100 transition-opacity" />
          <img
            src={compassSprite}
            alt="Pwint, your career compass sprite"
            width={88}
            height={88}
            className="relative h-20 w-20 sm:h-24 sm:w-24 lp-float drop-shadow-[0_8px_24px_color-mix(in_oklab,var(--gold)_50%,transparent)] group-hover:scale-110 transition-transform"
          />
        </Link>
      </div>
    </div>
  );
}
