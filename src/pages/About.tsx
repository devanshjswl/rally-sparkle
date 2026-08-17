import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  HeartPulse,
  Target,
  Users,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/hospital/primitives";

const values = [
  { icon: Target, title: "Our Mission", body: "To end long OPD queues and make hospital operations run on live, accurate data instead of guesswork." },
  { icon: Users, title: "Who We Serve", body: "Patients, doctors, and hospital administrators — one platform built around all three workflows." },
  { icon: ShieldCheck, title: "Built for Trust", body: "Designed with data accuracy, transparency, and patient care as the top priorities." },
];

export default function About() {
  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <HeartPulse className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold">
              Aarogya<span className="text-primary">AI</span>
            </span>
          </Link>
          <nav className="ml-auto flex items-center gap-2">
            <Link to="/" className="px-3 text-sm text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <Link to="/about" className="px-3 text-sm font-medium text-foreground">
              About Us
            </Link>
            <Link to="/contact" className="px-3 text-sm text-muted-foreground hover:text-foreground">
              Contact Us
            </Link>
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm">
              <Link to="/login?role=admin">Staff/Admin Login</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/register">Patient Register</Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <Reveal>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            About <span className="text-primary">AarogyaAI</span>
          </h1>
          <p className="prose-readable mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            AarogyaAI is an AI-based smart hospital management system built to end the OPD queue problem —
            replacing paper tokens and guesswork with live data, digital tokens, and AI-predicted waiting times.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.06}>
              <Card className="h-full">
                <CardContent className="p-5">
                  <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <v.icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display text-lg font-semibold">{v.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{v.body}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-14 rounded-2xl border border-border bg-muted/40 p-6 md:p-8">
            <h2 className="font-display text-2xl font-bold tracking-tight">Our Story</h2>
            <p className="prose-readable mt-3 text-sm text-muted-foreground md:text-base">
              Built as a Smart India Hackathon prototype, AarogyaAI started with a simple observation —
              patients spend hours waiting in OPD queues without knowing how long the wait actually is,
              while hospitals struggle to balance doctor workload across departments. AarogyaAI brings
              patients, doctors, and administrators onto one system with real-time queues, AI-based
              triage, and hospital-wide analytics.
            </p>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted-foreground">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>AarogyaAI · City General Hospital, Pune — demo data, no real patient records.</p>
            <p>Smart India Hackathon prototype</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
