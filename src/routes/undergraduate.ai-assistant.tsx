import { createFileRoute, Link } from "@tanstack/react-router";
import { Bot, MessageSquareText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/undergraduate/ai-assistant")({
  head: () => ({
    meta: [
      { title: "AI Career Assistant — Lan Pwint" },
      {
        name: "description",
        content: "Ask the AI career assistant anything about your studies, internships, or next career steps.",
      },
    ],
  }),
  component: AIAssistantPage,
});

function AIAssistantPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-8 rounded-2xl border border-border bg-card p-8 lg:grid-cols-5 lg:p-12">
        <div className="lg:col-span-3">
          <Badge variant="secondary" className="bg-teal/15 text-teal hover:bg-teal/20">
            <Bot className="mr-1 h-3 w-3" /> AI Career Assistant
          </Badge>
          <h2 className="mt-4 font-serif text-3xl text-navy">
            Ask anything. Get clear, career-specific answers.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Confused about a topic from class? Wondering which skill to learn next? Curious how internships at
            different companies compare? Your AI assistant is built to guide students like you.
          </p>
          <div className="mt-6">
            <Button asChild className="bg-navy text-navy-foreground hover:bg-deep">
              <Link to="/auth" search={{ as: "student" }}>
                <MessageSquareText className="mr-2 h-4 w-4" /> Open the assistant
              </Link>
            </Button>
          </div>
        </div>
        <div className="rounded-xl bg-muted p-5 lg:col-span-2">
          <div className="space-y-3 text-sm">
            <ChatBubble who="user">What should I learn before a UX internship?</ChatBubble>
            <ChatBubble who="ai">
              Start with the basics of user research, then practice 2–3 wireframing tools. I can sketch out a 4-week
              prep plan — want me to?
            </ChatBubble>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChatBubble({ who, children }: { who: "user" | "ai"; children: React.ReactNode }) {
  const isUser = who === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          isUser
            ? "max-w-[85%] rounded-2xl rounded-tr-sm bg-navy px-4 py-2.5 text-navy-foreground"
            : "max-w-[85%] rounded-2xl rounded-tl-sm bg-card px-4 py-2.5 text-foreground border border-border"
        }
      >
        {children}
      </div>
    </div>
  );
}
