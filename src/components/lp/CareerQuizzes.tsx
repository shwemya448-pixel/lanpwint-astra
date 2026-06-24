import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { askGemini } from "@/lib/ai-gemini.functions";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, ChevronRight, RotateCcw } from "lucide-react";

type RKey = "R" | "I" | "A" | "S" | "E" | "C";
const RIASEC_LABELS: Record<RKey, string> = {
  R: "Realistic (Doers)",
  I: "Investigative (Thinkers)",
  A: "Artistic (Creators)",
  S: "Social (Helpers)",
  E: "Enterprising (Persuaders)",
  C: "Conventional (Organizers)",
};

const CAREER_QUESTIONS: { q: string; key: RKey }[] = [
  { q: "I enjoy building, fixing, or working with my hands.", key: "R" },
  { q: "I like working outdoors or with tools and machines.", key: "R" },
  { q: "I prefer practical tasks over abstract theory.", key: "R" },
  { q: "I love solving puzzles and figuring out how things work.", key: "I" },
  { q: "I enjoy science, research, and analyzing data.", key: "I" },
  { q: "I ask lots of 'why' and 'how' questions.", key: "I" },
  { q: "I express myself through art, music, writing, or design.", key: "A" },
  { q: "I value originality and creative freedom.", key: "A" },
  { q: "I get bored by strict rules and routines.", key: "A" },
  { q: "I love helping, teaching, or caring for others.", key: "S" },
  { q: "Friends come to me for advice and support.", key: "S" },
  { q: "I feel rewarded when I make someone's day better.", key: "S" },
  { q: "I like leading teams and convincing people of ideas.", key: "E" },
  { q: "I'd enjoy starting my own business one day.", key: "E" },
  { q: "I'm competitive and motivated by results.", key: "E" },
  { q: "I like clear instructions, lists, and organization.", key: "C" },
  { q: "I'm careful with details, numbers, and accuracy.", key: "C" },
  { q: "I enjoy planning, scheduling, and structure.", key: "C" },
];

const SCALE = [
  { v: 1, label: "Strongly disagree" },
  { v: 2, label: "Disagree" },
  { v: 3, label: "Neutral" },
  { v: 4, label: "Agree" },
  { v: 5, label: "Strongly agree" },
];

export function CareerQuizDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const ask = useServerFn(askGemini);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<null | { top: RKey[]; scores: Record<RKey, number> }>(null);
  const [aiText, setAiText] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const total = CAREER_QUESTIONS.length;
  const progress = Math.round((Object.keys(answers).length / total) * 100);

  const finish = async (finalAnswers: Record<number, number> = answers) => {
    const scores: Record<RKey, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    CAREER_QUESTIONS.forEach((q, i) => { scores[q.key] += finalAnswers[i] ?? 3; });
    const top = (Object.keys(scores) as RKey[]).sort((a, b) => scores[b] - scores[a]).slice(0, 3);
    setResult({ top, scores });
    setLoading(true);
    setAiText("");
    try {
      const { content } = await ask({
        data: {
          system:
            "You are a career discovery mentor for students aged 14-22. Based on a RIASEC profile, return a friendly, motivating response with these sections (use plain text headings, no markdown symbols): TOP 3 CAREERS (with one-line why), BEST MAJORS, KEY SKILLS TO BUILD NOW, GROWING DEMAND (next 5-10 years), TYPICAL SALARY RANGE (USD, global average), and FIRST STEP THIS WEEK. Keep it under 220 words.",
          prompt: `RIASEC profile (1-5 scale, sum of 3 questions each): Realistic=${scores.R}, Investigative=${scores.I}, Artistic=${scores.A}, Social=${scores.S}, Enterprising=${scores.E}, Conventional=${scores.C}. Top three: ${top.map((k) => RIASEC_LABELS[k]).join(", ")}.`,
        },
      });
      setAiText(content);
    } catch (e) {
      setAiText(e instanceof Error ? e.message : "AI request failed.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setAnswers({}); setStep(0); setResult(null); setAiText(""); };
  const current = CAREER_QUESTIONS[step];

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[color:var(--gold)]" /> Career Quiz
          </DialogTitle>
        </DialogHeader>
        {!result && (
          <div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden mb-4">
              <div className="h-full bg-[color:var(--gold)] transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="text-xs text-muted-foreground mb-2">Question {step + 1} of {total}</div>
            <div className="text-base sm:text-lg font-semibold mb-4">{current.q}</div>
            <div className="grid gap-2">
              {SCALE.map((s) => (
                <button
                  key={s.v}
                  onClick={() => {
                    const next = { ...answers, [step]: s.v };
                    setAnswers(next);
                    if (step < total - 1) setStep(step + 1); else finish(next);
                  }}
                  className={`text-left px-4 py-3 rounded-xl border transition hover:border-[color:var(--gold)] ${answers[step] === s.v ? "border-[color:var(--gold)] bg-[color:var(--gold)]/10" : "border-border"}`}
                >
                  <span className="text-xs text-muted-foreground mr-2">{s.v}</span> {s.label}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-4">
              <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="text-xs text-muted-foreground disabled:opacity-40">← Back</button>
              {step === total - 1 && answers[step] != null && (
                <button onClick={() => finish()} className="lp-gold-btn px-4 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-1">
                  See results <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
        {result && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div>
              <div className="text-xs uppercase tracking-widest text-[color:var(--gold)] mb-2">Your RIASEC Profile</div>
              <div className="space-y-2">
                {(Object.keys(result.scores) as RKey[]).map((k) => {
                  const pct = Math.round((result.scores[k] / 15) * 100);
                  return (
                    <div key={k}>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{RIASEC_LABELS[k]}</span>
                        <span className="text-muted-foreground">{result.scores[k]}/15</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-[color:var(--gold)]" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="lp-glass rounded-xl p-4 text-sm whitespace-pre-line leading-relaxed min-h-[100px]">
              {loading ? "Generating personalized career insights…" : aiText}
            </div>
            <button onClick={reset} className="text-xs inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
              <RotateCcw className="h-3 w-3" /> Retake quiz
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

type MAxis = "EI" | "SN" | "TF" | "JP";
const MBTI_QUESTIONS: { q: string; axis: MAxis; a: string; b: string; aLetter: string; bLetter: string }[] = [
  { q: "At a party, you usually…", axis: "EI", a: "Talk to many people, including strangers", b: "Stick with a few people you know well", aLetter: "E", bLetter: "I" },
  { q: "You recharge by…", axis: "EI", a: "Being around people", b: "Spending time alone", aLetter: "E", bLetter: "I" },
  { q: "In group projects you…", axis: "EI", a: "Think out loud and lead discussion", b: "Reflect first, then share", aLetter: "E", bLetter: "I" },
  { q: "You'd rather have…", axis: "EI", a: "A wide circle of friends", b: "A few deep friendships", aLetter: "E", bLetter: "I" },
  { q: "You trust more…", axis: "SN", a: "Facts, details, and experience", b: "Patterns, ideas, and possibilities", aLetter: "S", bLetter: "N" },
  { q: "You prefer reading about…", axis: "SN", a: "Real events and how-to guides", b: "Theories, futures, and 'what if'", aLetter: "S", bLetter: "N" },
  { q: "Teachers say you are more…", axis: "SN", a: "Practical and grounded", b: "Imaginative and curious", aLetter: "S", bLetter: "N" },
  { q: "When learning, you focus on…", axis: "SN", a: "Step-by-step instructions", b: "Big picture and meaning", aLetter: "S", bLetter: "N" },
  { q: "When making decisions you rely on…", axis: "TF", a: "Logic and objective analysis", b: "Values and how people feel", aLetter: "T", bLetter: "F" },
  { q: "It's worse to be…", axis: "TF", a: "Illogical", b: "Unkind", aLetter: "T", bLetter: "F" },
  { q: "In an argument you want to…", axis: "TF", a: "Find the truth", b: "Keep harmony", aLetter: "T", bLetter: "F" },
  { q: "Compliments mean more when they're about your…", axis: "TF", a: "Skills and competence", b: "Kindness and character", aLetter: "T", bLetter: "F" },
  { q: "You like your week to be…", axis: "JP", a: "Planned and scheduled", b: "Flexible and spontaneous", aLetter: "J", bLetter: "P" },
  { q: "Deadlines should be…", axis: "JP", a: "Set early and respected", b: "Loose so you can adapt", aLetter: "J", bLetter: "P" },
  { q: "Your room/desk is usually…", axis: "JP", a: "Tidy and organized", b: "Creatively messy", aLetter: "J", bLetter: "P" },
  { q: "You feel best when…", axis: "JP", a: "A decision is made", b: "Options are still open", aLetter: "J", bLetter: "P" },
];

export function PersonalityTestDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const ask = useServerFn(askGemini);
  const [answers, setAnswers] = useState<Record<number, "a" | "b">>({});
  const [step, setStep] = useState(0);
  const [type, setType] = useState<string | null>(null);
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);

  const total = MBTI_QUESTIONS.length;
  const progress = Math.round((Object.keys(answers).length / total) * 100);

  const finish = async (finalAnswers: Record<number, "a" | "b"> = answers) => {
    const tally: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    MBTI_QUESTIONS.forEach((q, i) => {
      const ans = finalAnswers[i];
      if (!ans) return;
      tally[ans === "a" ? q.aLetter : q.bLetter] += 1;
    });
    const result =
      (tally.E >= tally.I ? "E" : "I") +
      (tally.S >= tally.N ? "S" : "N") +
      (tally.T >= tally.F ? "T" : "F") +
      (tally.J >= tally.P ? "J" : "P");
    setType(result);
    setLoading(true);
    setAiText("");
    try {
      const { content } = await ask({
        data: {
          system:
            "You are a friendly personality coach for students. Given an MBTI 4-letter type, return: WHO YOU ARE (2 sentences), STRENGTHS (3 bullets), BLIND SPOTS (2 bullets), STUDY STYLE (2 sentences), BEST CAREER FIELDS (5 suggestions), and FAMOUS PEOPLE WITH THIS TYPE (3 names). Use plain text headings, no markdown symbols. Under 220 words.",
          prompt: `MBTI type: ${result}.`,
        },
      });
      setAiText(content);
    } catch (e) {
      setAiText(e instanceof Error ? e.message : "AI request failed.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setAnswers({}); setStep(0); setType(null); setAiText(""); };
  const current = MBTI_QUESTIONS[step];

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[color:var(--gold)]" /> Personality Test
          </DialogTitle>
        </DialogHeader>
        {!type && (
          <div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden mb-4">
              <div className="h-full bg-[color:var(--gold)] transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="text-xs text-muted-foreground mb-2">Question {step + 1} of {total}</div>
            <div className="text-base sm:text-lg font-semibold mb-4">{current.q}</div>
            <div className="grid gap-2">
              {(["a", "b"] as const).map((side) => (
                <button
                  key={side}
                  onClick={() => {
                    const next = { ...answers, [step]: side };
                    setAnswers(next);
                    if (step < total - 1) setStep(step + 1); else finish(next);
                  }}
                  className={`text-left px-4 py-3 rounded-xl border transition hover:border-[color:var(--gold)] ${answers[step] === side ? "border-[color:var(--gold)] bg-[color:var(--gold)]/10" : "border-border"}`}
                >
                  {side === "a" ? current.a : current.b}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-4">
              <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="text-xs text-muted-foreground disabled:opacity-40">← Back</button>
            </div>
          </div>
        )}
        {type && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="text-center py-4">
              <div className="text-xs uppercase tracking-widest text-[color:var(--gold)] mb-1">Your personality type</div>
              <div className="text-5xl font-black tracking-tight">{type}</div>
            </div>
            <div className="lp-glass rounded-xl p-4 text-sm whitespace-pre-line leading-relaxed min-h-[100px]">
              {loading ? "Generating personality insights…" : aiText}
            </div>
            <button onClick={reset} className="text-xs inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
              <RotateCcw className="h-3 w-3" /> Retake test
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

const EXPERIMENTS = [
  { role: "Software Engineer", task: "Build a tiny app on Replit or Lovable in 1 hour — even a to-do list counts." },
  { role: "Doctor / Healthcare", task: "Shadow a clinic for half a day or watch 3 surgery videos and journal what you felt." },
  { role: "Designer", task: "Redesign your favorite app's home screen in Figma — 90 minutes, no perfection." },
  { role: "Entrepreneur", task: "Sell something (anything) online today. Document what you learned in 5 lines." },
  { role: "Writer / Journalist", task: "Interview one stranger and write a 300-word profile about them." },
  { role: "Scientist", task: "Pick a question, design a tiny experiment, log results for 3 days." },
  { role: "Teacher", task: "Teach a 10-min lesson on something you love to a sibling or friend." },
  { role: "Filmmaker", task: "Shoot and edit a 60-second short on your phone today." },
  { role: "Psychologist", task: "Active-listen to a friend for 20 minutes — only ask questions, no advice." },
  { role: "Architect", task: "Sketch the floor plan of your dream home on paper. Add scale and light sources." },
];

export function ExperimentsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const list = useMemo(() => EXPERIMENTS, []);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[color:var(--gold)]" /> Career Experiments
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground mb-3">
          Pick one. Spend a day "trying" the role before committing 4 years to a degree.
        </p>
        <div className="grid sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
          {list.map((e) => (
            <div key={e.role} className="lp-glass rounded-xl p-4">
              <div className="font-bold text-sm mb-1">{e.role}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{e.task}</div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
