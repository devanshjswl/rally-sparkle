import { motion } from "framer-motion";
import { Brain, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Prediction } from "@/lib/hospital/ai";
import type { AppointmentStatus, Priority } from "@/lib/hospital/types";

export const ease = [0.22, 1, 0.36, 1] as const;

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-prose text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: any;
  tone?: "default" | "primary" | "warning" | "danger" | "success";
}) {
  const tones: Record<string, string> = {
    default: "text-foreground bg-muted",
    primary: "text-primary bg-primary/10",
    warning: "text-warning bg-warning/10",
    danger: "text-destructive bg-destructive/10",
    success: "text-success bg-success/10",
  };
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="flex items-start gap-3 p-4">
        {Icon && (
          <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", tones[tone])}>
            <Icon className="h-4 w-4" />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="font-display text-2xl font-bold leading-tight">{value}</p>
          {hint && <p className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const map: Record<AppointmentStatus, string> = {
    waiting: "bg-warning/15 text-warning border-warning/30",
    "in-consultation": "bg-primary/15 text-primary border-primary/30",
    completed: "bg-success/15 text-success border-success/30",
    cancelled: "bg-muted text-muted-foreground border-border",
  };
  const label: Record<AppointmentStatus, string> = {
    waiting: "Waiting",
    "in-consultation": "In consultation",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return <Badge variant="outline" className={cn("text-[11px]", map[status])}>{label[status]}</Badge>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const map: Record<Priority, string> = {
    emergency: "bg-destructive/15 text-destructive border-destructive/30",
    high: "bg-warning/15 text-warning border-warning/30",
    normal: "bg-muted text-muted-foreground border-border",
  };
  return (
    <Badge variant="outline" className={cn("text-[11px] capitalize", map[priority])}>
      {priority}
    </Badge>
  );
}

/** Renders any AI prediction with its confidence and contributing factors. */
export function AIPredictionCard({
  title,
  prediction,
  primary,
  footer,
}: {
  title: string;
  prediction: Prediction<any>;
  primary: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Card className="relative overflow-hidden border-primary/20">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Brain className="h-4 w-4 text-primary" /> {title}
          </CardTitle>
          <Badge variant="secondary" className="text-[10px] font-mono">{prediction.model}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="font-display text-3xl font-bold leading-none">{primary}</div>
        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Model confidence
            </span>
            <span>{Math.round(prediction.confidence * 100)}%</span>
          </div>
          <Progress value={prediction.confidence * 100} className="h-1.5" />
        </div>
        <ul className="space-y-1 text-xs text-muted-foreground">
          {prediction.factors.map((f) => (
            <li key={f} className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
              {f}
            </li>
          ))}
        </ul>
        {footer}
      </CardContent>
    </Card>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border py-12 text-center">
      <p className="font-medium">{title}</p>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}
