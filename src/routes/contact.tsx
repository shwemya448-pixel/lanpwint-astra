import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, MessageSquare } from "lucide-react";
import { PageHeader, PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Lan Pwint" },
      { name: "description", content: "Get in touch with the Lan Pwint team." },
      { property: "og:title", content: "Contact Lan Pwint" },
      { property: "og:description", content: "We'd love to hear from you." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <PageShell>
      <PageHeader eyebrow="Contact" title="Let's talk" description="Questions, feedback, or partnership ideas — we'd love to hear from you." />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-6">
            <ContactItem icon={Mail} title="Email" lines={["hello@lanpwint.app"]} />
            <ContactItem icon={MessageSquare} title="Support" lines={["support@lanpwint.app", "Mon–Fri · 9am–6pm"]} />
            <ContactItem icon={MapPin} title="Based in" lines={["Yangon, Myanmar"]} />
          </div>

          <form
            className="rounded-2xl border border-border bg-card p-6 sm:p-8 lg:col-span-2"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Thanks — we'll be in touch soon.");
              (e.target as HTMLFormElement).reset();
            }}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" required placeholder="Your name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" required type="email" placeholder="you@example.com" />
              </div>
            </div>
            <div className="mt-5 space-y-1.5">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" required placeholder="What's this about?" />
            </div>
            <div className="mt-5 space-y-1.5">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" required rows={6} placeholder="Tell us a little more..." />
            </div>
            <div className="mt-6 flex justify-end">
              <Button type="submit" className="bg-navy text-navy-foreground hover:bg-deep">Send message</Button>
            </div>
          </form>
        </div>
      </section>
    </PageShell>
  );
}

function ContactItem({
  icon: Icon,
  title,
  lines,
}: {
  icon: typeof Mail;
  title: string;
  lines: string[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <Icon className="h-5 w-5 text-teal" />
      <div className="mt-3 font-serif text-lg text-navy">{title}</div>
      {lines.map((l) => (
        <div key={l} className="text-sm text-muted-foreground">{l}</div>
      ))}
    </div>
  );
}
