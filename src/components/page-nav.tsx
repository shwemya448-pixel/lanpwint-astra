import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";

export interface PageNavItem {
  /** Route path (e.g. "/undergraduate/ai-assistant") */
  to: string;
  label: string;
}

export function PageNav({ items }: { items: PageNavItem[] }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="border-b border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul className="flex gap-1 overflow-x-auto py-2 text-sm">
          {items.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <li key={item.to}>
                <Link
                  to={item.to as never}
                  className={
                    "inline-block whitespace-nowrap rounded-md px-3 py-2 transition-colors " +
                    (active
                      ? "bg-navy text-navy-foreground dark:bg-mist dark:text-navy"
                      : "text-muted-foreground hover:bg-muted hover:text-navy dark:hover:text-mist")
                  }
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export function PageSection({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={className}>
      {children}
    </section>
  );
}
