import { createFileRoute } from "@tanstack/react-router";
import { UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/graduates/profile")({
  head: () => ({ meta: [{ title: "Job-Seeking Profile — Lan Pwint" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <section className="border-y border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-teal">Job-seeking profile</p>
            <h2 className="mt-3 font-serif text-3xl text-navy sm:text-4xl">
              One profile. Visible to every verified employer.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Showcase your education, skills, experience, and the role you want next. Employers searching for
              candidates with your skills will find your profile and reach out directly.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Highlight education, skills, and experience",
                "Specify your desired role and availability",
                "Receive direct messages from verified employers",
                "Update your profile any time you want",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <SampleProfile />
        </div>
      </div>
    </section>
  );
}

function SampleProfile() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="bg-gradient-to-br from-navy to-deep p-6 text-navy-foreground">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-mist text-navy">
            <UserCircle2 className="h-8 w-8" />
          </div>
          <div>
            <div className="font-serif text-xl">May Thandar</div>
            <div className="text-sm opacity-80">B.Sc. Computer Science · Open to work</div>
          </div>
        </div>
      </div>
      <div className="space-y-4 p-6 text-sm">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Looking for</div>
          <div className="mt-1 font-medium">Junior Frontend Developer (Remote / Yangon)</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Skills</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["React", "TypeScript", "Tailwind", "Figma", "REST APIs"].map((s) => (
              <span key={s} className="rounded-full bg-muted px-2.5 py-1 text-xs">{s}</span>
            ))}
          </div>
        </div>
        <Button size="sm" className="w-full bg-navy text-navy-foreground hover:bg-deep">
          Contact candidate
        </Button>
      </div>
    </div>
  );
}
