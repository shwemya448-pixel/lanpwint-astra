import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AuthMenu } from "./auth-menu";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/undergraduate", label: "Undergraduate" },
  { to: "/graduates", label: "Graduates" },
  { to: "/candidates", label: "Candidates" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-navy text-navy-foreground font-serif text-lg leading-none">
            L
          </span>
          <div className="leading-tight">
            <div className="font-serif text-base text-navy">Lan Pwint</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              လမ်းပွင့်
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className={cn(
                "rounded-md px-3 py-2 text-sm text-foreground/75 transition-colors hover:text-foreground hover:bg-muted",
              )}
              activeProps={{
                className: "text-navy font-medium bg-muted",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
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
                {item.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/auth" search={{ as: "student" }} onClick={() => setOpen(false)}>
                  Student Login
                </Link>
              </Button>
              <Button asChild size="sm" className="bg-navy text-navy-foreground hover:bg-deep">
                <Link to="/auth" search={{ as: "employer" }} onClick={() => setOpen(false)}>
                  Employer Login
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
