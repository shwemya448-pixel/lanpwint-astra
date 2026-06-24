import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-navy text-navy-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-teal text-teal-foreground font-serif text-lg">
              L
            </span>
            <div className="leading-tight">
              <div className="font-serif text-lg">Lan Pwint</div>
              <div className="text-[11px] uppercase tracking-[0.18em] opacity-70">လမ်းပွင့်</div>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm opacity-80">
            A career development platform helping students and graduates build successful careers through
            learning, internships, and employment opportunities.
          </p>
        </div>

        <div>
          <h4 className="font-serif text-sm">Platform</h4>
          <ul className="mt-3 space-y-2 text-sm opacity-80">
            <li><Link to="/undergraduate" className="hover:opacity-100 hover:underline">Undergraduate</Link></li>
            <li><Link to="/graduates" className="hover:opacity-100 hover:underline">Graduates</Link></li>
            <li><Link to="/candidates" className="hover:opacity-100 hover:underline">Candidates</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-sm">Company</h4>
          <ul className="mt-3 space-y-2 text-sm opacity-80">
            <li><Link to="/about" className="hover:opacity-100 hover:underline">About us</Link></li>
            <li><Link to="/contact" className="hover:opacity-100 hover:underline">Contact</Link></li>
            <li><Link to="/auth" search={{ as: "student" }} className="hover:opacity-100 hover:underline">Sign in</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs opacity-70 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Lan Pwint. All rights reserved.</p>
          <p>Built for students, graduates, and employers.</p>
        </div>
      </div>
    </footer>
  );
}
