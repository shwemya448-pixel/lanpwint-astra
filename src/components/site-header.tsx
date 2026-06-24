import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AuthMenu } from "./auth-menu";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";
import { useLocale, type TKey } from "@/lib/i18n";

const NAV: { to: string; key: TKey }[] = [
  { to: "/", key: "nav.home" },
  { to: "/undergraduate", key: "nav.undergraduate" },
  { to: "/graduates", key: "nav.graduates" },
  { to: "/candidates", key: "nav.candidates" },
  { to: "/news", key: "nav.news" },
  { to: "/find-passion", key: "nav.findPassion" },
  { to: "/about", key: "nav.about" },
  { to: "/contact", key: "nav.contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { t } = useLocale();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-2.5 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-[color:var(--gold)] text-[color:var(--navy)] font-serif text-lg leading-none shadow-[0_4px_18px_-6px_color-mix(in_oklab,var(--gold)_55%,transparent)]">
            L
          </span>
          <div className="leading-tight">
            <div className="font-serif text-base text-foreground">Lan Pwint</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--gold)]/80">
              လမ်းပွင့်
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 xl:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className={cn(
                "rounded-md px-3 py-2 text-sm text-foreground/75 transition-colors hover:text-[color:var(--gold)] hover:bg-muted",
              )}
              activeProps={{ className: "text-[color:var(--gold)] font-medium bg-muted" }}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageToggle />
          <ThemeToggle />
          <AuthMenu />
        </div>

        <button
          aria-label="Toggle menu"
          className="rounded-md p-2 hover:bg-muted lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm hover:bg-muted"
              >
                {t(item.key)}
              </Link>
            ))}
            <div className="mt-2 flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/auth" search={{ as: "student" }} onClick={() => setOpen(false)}>
                  {t("auth.studentLogin")}
                </Link>
              </Button>
              <Button asChild size="sm" className="bg-[color:var(--gold)] text-[color:var(--navy)] hover:brightness-110">
                <Link to="/auth" search={{ as: "employer" }} onClick={() => setOpen(false)}>
                  {t("auth.employerLogin")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
