import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { useRoleShell } from "./role-shell";

export function PageShell({ children }: { children: ReactNode }) {
  const role = useRoleShell();
  // When inside a role-specific layout, the role layout already renders the
  // header + footer. Avoid stacking shells.
  if (role) return <>{children}</>;
  return (
    <div className="flex min-h-screen flex-col bg-background lp-aurora lp-aurora-grain">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="border-b border-border bg-gradient-to-b from-muted/50 to-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.22em] text-teal">{eyebrow}</p>
        )}
        <h1 className="mt-3 font-serif text-4xl text-navy sm:text-5xl">{title}</h1>
        {description && (
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{description}</p>
        )}
      </div>
    </section>
  );
}
