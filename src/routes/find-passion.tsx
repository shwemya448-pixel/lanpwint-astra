import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Compass, Heart, Brain, FlaskConical } from "lucide-react";
import { AIPanel } from "@/components/lp/AIPanel";
import { CareerQuizDialog, PersonalityTestDialog, ExperimentsDialog } from "@/components/lp/CareerQuizzes";
import { ShootingStars } from "@/components/lp/ShootingStars";

export const Route = createFileRoute("/find-passion")({
  head: () => ({
    meta: [
      { title: "Find Your Passion — Lan Pwint" },
      { name: "description", content: "Career Discovery AI: quizzes, personality tests, and experiments to find your direction." },
    ],
  }),
  component: FindPassionPage,
});

function FindPassionPage() {
  const [quiz, setQuiz] = useState(false);
  const [pers, setPers] = useState(false);
  const [exp, setExp] = useState(false);

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <ShootingStars />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-5 pt-8 pb-16">
        <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-[color:var(--gold)]">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to gateway
        </Link>

        <header className="mt-6 mb-8">
          <div className="lp-divider-gold w-20 mb-3" />
          <h1 className="text-3xl sm:text-4xl font-bold lp-shimmer-text">Find Your Passion</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            Discover your career direction through interests, personality, and AI-powered matching.
          </p>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Tile icon={<Compass />} title="Career Quiz" desc="18 questions · RIASEC profile" onClick={() => setQuiz(true)} />
          <Tile icon={<Brain />} title="Personality Test" desc="16 questions · MBTI type" onClick={() => setPers(true)} />
          <Tile icon={<FlaskConical />} title="Career Experiments" desc="Try a day in the role" onClick={() => setExp(true)} />
          <Tile icon={<Heart />} title="Passion Matching" desc="AI maps interests → paths" onClick={() => document.getElementById("career-ai")?.scrollIntoView({ behavior: "smooth" })} />
        </div>

        <div id="career-ai">
          <AIPanel
            title="Career Discovery AI"
            hint="Tell me your interests, hobbies, favorite subjects, dream lifestyle, and what you're good at. The more details, the better the match."
            placeholder="e.g. I love biology and drawing. I'm patient and dream of helping people."
            system={
              "You are an expert career discovery mentor for students aged 14-22. Read the student's input carefully and respond with these sections in this exact order, using plain text headings (no markdown symbols, no asterisks): \n\nTOP 3 CAREERS — for each: name, one-line why it fits them.\nBEST MAJORS — 3 options.\nKEY SKILLS TO BUILD NOW — 4 bullets, concrete.\nGROWING DEMAND — outlook for next 5-10 years.\nTYPICAL SALARY RANGE — entry to senior, USD global average.\nFIRST STEP THIS WEEK — one tiny action they can do today.\n\nBe warm, specific, and motivating. Reference details from their input. Keep total under 280 words."
            }
          />
        </div>

        <CareerQuizDialog open={quiz} onOpenChange={setQuiz} />
        <PersonalityTestDialog open={pers} onOpenChange={setPers} />
        <ExperimentsDialog open={exp} onOpenChange={setExp} />
      </div>
    </div>
  );
}

function Tile({ icon, title, desc, onClick }: { icon: React.ReactNode; title: string; desc: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="lp-card p-5 text-left hover:-translate-y-0.5 transition">
      <div className="h-10 w-10 rounded-xl lp-glass flex items-center justify-center text-[color:var(--gold)]">{icon}</div>
      <div className="mt-3 font-bold">{title}</div>
      <div className="text-xs text-muted-foreground mt-1">{desc}</div>
    </button>
  );
}
