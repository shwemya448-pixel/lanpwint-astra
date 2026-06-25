import { ArrowRight, Briefcase, GraduationCap } from "lucide-react";

export type PortalKind = "student" | "candidate";

const META: Record<PortalKind, { title: string; desc: string; icon: typeof GraduationCap }> = {
  student: {
    title: "Candidates",
    desc: "Discover your passion, build skills, find scholarships, craft a winning CV, and transition into your career.",
    icon: GraduationCap,
  },
  candidate: {
    title: "Employers",
    desc: "Post jobs, pin them on the Myanmar map, browse candidate CVs, and message candidates directly.",
    icon: Briefcase,
  },
};

export function PortalCard({
  kind,
  onChoose,
  index,
}: {
  kind: PortalKind;
  onChoose: (k: PortalKind) => void;
  index: number;
}) {
  const { title, desc, icon: Icon } = META[kind];
  return (
    <button
      type="button"
      onClick={() => onChoose(kind)}
      className="group relative lp-card p-5 sm:p-7 text-left transition hover:-translate-y-1 hover:shadow-2xl lp-animate-in"
      style={{ animationDelay: `${0.15 + index * 0.12}s` }}
    >
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition pointer-events-none"
        style={{
          background:
            "radial-gradient(400px 200px at 50% -10%, color-mix(in oklab, var(--gold) 25%, transparent), transparent 70%)",
        }}
      />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-2xl lp-glass flex items-center justify-center lp-float">
            <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-[color:var(--gold)]" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">0{index + 1}</span>
        </div>
        <h3 className="mt-5 sm:mt-6 text-xl sm:text-2xl font-bold">{title}</h3>
        <div className="mt-2 lp-divider-gold" />
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{desc}</p>
        <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--gold)]">
          Enter portal <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </div>
      </div>
    </button>
  );
}
