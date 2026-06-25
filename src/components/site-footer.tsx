import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[color:var(--gold)]/30 bg-[#0B1F3A] text-[#F5F1E8]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-[color:var(--gold)] text-[#0B1F3A] font-serif text-lg">
              L
            </span>
            <div className="leading-tight">
              <div className="font-serif text-lg text-[#F5F1E8]">Lan Pwint</div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-[#F5F1E8]/70">လမ်းပွင့်</div>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm text-[#F5F1E8]/85">
            A career development platform helping students and graduates build successful careers through
            learning, internships, and employment opportunities.
          </p>
        </div>

        <div>
          <h4 className="font-serif text-sm text-[color:var(--gold)]">Platform</h4>
          <ul className="mt-3 space-y-2 text-sm text-[#F5F1E8]/85">
            <li><Link to="/student/dashboard" className="hover:text-[color:var(--gold)] hover:underline">Students</Link></li>
            <li><Link to="/candidates" className="hover:text-[color:var(--gold)] hover:underline">For Employers</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-sm text-[color:var(--gold)]">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-[#F5F1E8]/85">
            <li><Link to="/about" className="hover:text-[color:var(--gold)] hover:underline">About us</Link></li>
            <li><Link to="/contact" className="hover:text-[color:var(--gold)] hover:underline">Contact</Link></li>
            <li><Link to="/auth" search={{ as: "student" }} className="hover:text-[color:var(--gold)] hover:underline">Sign in</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#F5F1E8]/15">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-[#F5F1E8]/70 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Lan Pwint. All rights reserved.</p>
          <p>Built for students, graduates, and employers.</p>
        </div>
      </div>
    </footer>
  );
}
