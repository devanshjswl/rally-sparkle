import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HeartPulse, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Reveal } from "@/components/hospital/primitives";
import { toast } from "sonner";

export default function Contact() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent — we'll get back to you soon.");
    (e.target as HTMLFormElement).reset();
  };

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
            <Link to="/about" className="px-3 text-sm text-muted-foreground hover:text-foreground">
              About Us
            </Link>
            <Link to="/contact" className="px-3 text-sm font-medium text-foreground">
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
            Get in <span className="text-primary">Touch</span>
          </h1>
          <p className="prose-readable mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            Questions about AarogyaAI, a demo, or a partnership? Send us a message and our team will get back to you.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-5">
          <Reveal className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                <form className="grid gap-4" onSubmit={handleSubmit}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Your name" required />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="you@example.com" required />
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="What is this about?" required />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="Write your message..." rows={5} required />
                  </div>
                  <Button type="submit" size="lg" className="mt-2 w-fit">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delay={0.08} className="lg:col-span-2">
            <div className="grid gap-4">
              <Card>
                <CardContent className="flex items-start gap-3 p-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Mail className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-display text-sm font-semibold">Email</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">contact@aarogyaai.com</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-start gap-3 p-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Phone className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-display text-sm font-semibold">Phone</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">+91 98765 43210</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-start gap-3 p-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-display text-sm font-semibold">Location</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">City General Hospital, Pune, Maharashtra</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Reveal>
        </div>
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
