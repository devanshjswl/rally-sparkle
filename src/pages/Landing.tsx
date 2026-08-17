import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";
import {
  HeartPulse,
  Ticket,
  Brain,
  Clock,
  Siren,
  Stethoscope,
  BarChart3,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal, ease } from "@/components/hospital/primitives";

const features = [
  { icon: Ticket, title: "Digital tokens", body: "Patients get a token the moment they book — no paper slips, no crowding at the counter." },
  { icon: Clock, title: "Live queue & ETA", body: "Real-time position in the OPD queue with an AI-estimated waiting time that updates as the day moves." },
  { icon: Brain, title: "AI triage & priority", body: "Symptom text and age are scored to surface urgent patients before they deteriorate." },
  { icon: Siren, title: "Emergency board", body: "Colour-coded triage board for casualty, with doctor assignment and treatment status." },
  { icon: Stethoscope, title: "Doctor & OPD control", body: "Departments, doctors, schedules and availability managed from one console." },
  { icon: BarChart3, title: "Hospital analytics", body: "Footfall, workload balance and OPD crowd forecasts for the rest of the day." },
];

const roles = [
  { role: "Patient", body: "Register, search doctors by department, book an appointment, hold a digital token and track the queue live.", to: "/login?role=patient" },
  { role: "Doctor", body: "See today's prioritised queue, call the next patient, review workload and handle emergency referrals.", to: "/login?role=doctor" },
  { role: "Admin / Nurse", body: "Run OPD queues, manage doctors and departments, triage emergencies and read hospital analytics.", to: "/login?role=admin" },
];

const stats = [
  { v: "42%", l: "shorter average OPD wait" },
  { v: "8", l: "departments live" },
  { v: "24x7", l: "emergency triage" },
  { v: "5", l: "AI models in the loop" },
];

export default function Landing() {
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
  <ThemeToggle />
  <Button asChild variant="ghost" size="sm">
    <Link to="/login">Sign in</Link>
  </Button>
  <Button asChild size="sm">
    <Link to="/register">Register as patient</Link>
  </Button>
</nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-success/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="max-w-3xl"
          >
            <Badge variant="secondary" className="mb-5 gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> AI-Based Smart Hospital Management System
            </Badge>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              End the OPD queue.
              <br />
              <span className="text-primary">Run the hospital on live data.</span>
            </h1>
            <p className="prose-readable mt-5 text-base text-muted-foreground md:text-lg">
              Digital tokens, real-time queue tracking and AI-predicted waiting times for patients —
              prioritised queues, workload balance and OPD crowd forecasts for doctors and
              administration. One system, three focused workflows.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/register">
                  Get a digital token <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/login?role=admin">Explore hospital console</Link>
              </Button>
            </div>
          </motion.div>

          <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.l} delay={i * 0.06}>
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="font-display text-2xl font-bold text-primary md:text-3xl">{s.v}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.l}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <h2 className="font-display text-3xl font-bold tracking-tight">Built around the real OPD problem</h2>
          <p className="prose-readable mt-2 text-muted-foreground">
            Every module maps to a step patients actually go through — booking, token, queue, consultation, follow-up.
          </p>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.05}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-muted/40 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <h2 className="font-display text-3xl font-bold tracking-tight">Three workflows, one hospital</h2>
          </Reveal>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {roles.map((r, i) => (
              <Reveal key={r.role} delay={i * 0.07}>
                <Card className="h-full">
                  <CardContent className="flex h-full flex-col p-5">
                    <Badge className="mb-3 w-fit" variant="outline">{r.role}</Badge>
                    <p className="text-sm text-muted-foreground">{r.body}</p>
                    <Button asChild variant="ghost" className="mt-4 w-fit px-0 text-primary hover:bg-transparent">
                      <Link to={r.to}>
                        Open {r.role.toLowerCase()} view <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted-foreground">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>AarogyaAI · City General Hospital, Pune — demo data, no real patient records.</p>
          <p>Smart India Hackathon prototype</p>
        </div>
      </footer>
    </div>
  );
}
