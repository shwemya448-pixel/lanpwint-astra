import type { ReactNode } from "react";

export interface PageNavItem {
  id: string;
  label: string;
}

export function PageNav({ items }: { items: PageNavItem[] }) {
  return (
    <nav className="sticky top-[var(--header-height,64px)] z-30 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul className="flex gap-6 overflow-x-auto py-3 text-sm">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="whitespace-nowrap text-muted-foreground transition-colors hover:text-navy dark:hover:text-mist"
              >
                {item.label}
              </a>
            </li>
          ))}
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
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={className}>
      {children}
    </section>
  );
}
