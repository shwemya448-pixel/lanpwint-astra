import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/graduates/messaging")({
  head: () => ({ meta: [{ title: "Messaging — Lan Pwint" }] }),
  component: MessagingPage,
});

function MessagingPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <MessageCircle className="mx-auto h-6 w-6 text-teal" />
      <h2 className="mt-4 font-serif text-3xl text-navy">Direct messaging with employers</h2>
      <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
        No middlemen, no lost emails. When an employer is interested, the conversation happens right here.
      </p>
      <div className="mt-8">
        <Button asChild size="lg" className="bg-navy text-navy-foreground hover:bg-deep">
          <Link to="/auth" search={{ as: "student" }}>Get started as a graduate</Link>
        </Button>
      </div>
    </section>
  );
}
