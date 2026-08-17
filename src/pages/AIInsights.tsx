import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AIPredictionCard, PageHeader, Reveal } from "@/components/hospital/primitives";
import { useAppointments, useDoctors } from "@/hooks/useHospital";
import { opdCrowdForecast, today } from "@/lib/hospital/api";
import { optimiseAppointments, predictCrowd, predictWorkload } from "@/lib/hospital/ai";
import { useHospitalAuth } from "@/contexts/HospitalAuthContext";

export default function AIInsights() {
  const { user } = useHospitalAuth();
  const { data: doctors } = useDoctors();
  const { data: appointments } = useAppointments({ date: today });

  const crowd = predictCrowd(opdCrowdForecast);
  const optimisation = doctors && appointments ? optimiseAppointments(appointments, doctors) : null;
  const workloads =
    doctors && appointments
      ? doctors
          .filter((d) => (user?.role === "doctor" ? d.id === user.doctorId : true))
          .map((d) => ({ doctor: d, prediction: predictWorkload(d, appointments) }))
          .sort((a, b) => b.prediction.value.index - a.prediction.value.index)
      : [];

  return (
    <div>
      <PageHeader
        title="AI insights"
        subtitle="Waiting time, patient priority, appointment optimisation, doctor workload and OPD crowd — models run on live hospital data."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">OPD crowd prediction — today</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={opdCrowdForecast}>
                  <defs>
                    <linearGradient id="pred" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="predicted" name="Predicted footfall" stroke="hsl(var(--primary))" fill="url(#pred)" strokeWidth={2} />
                  <Line type="monotone" dataKey="actual" name="Actual footfall" stroke="hsl(var(--foreground))" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.08}>
          <AIPredictionCard
            title="Crowd forecast"
            prediction={crowd}
            primary={`Peak ${crowd.value.peakHour}`}
            footer={
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Expected peak load: {crowd.value.peakLoad} patients/hour</p>
                <p>Quietest upcoming hour: {crowd.value.quietHour} — route walk-ins here</p>
              </div>
            }
          />
        </Reveal>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Reveal>
          <Card className="h-full">
            <CardHeader><CardTitle className="text-base">Doctor workload index</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {workloads.map(({ doctor, prediction }) => (
                <div key={doctor.id}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                    <span className="truncate font-medium">{doctor.name}</span>
                    <span className="flex shrink-0 items-center gap-2 text-muted-foreground">
                      <Badge
                        variant="outline"
                        className={
                          prediction.value.label === "Overloaded"
                            ? "border-destructive/30 bg-destructive/10 text-destructive"
                            : prediction.value.label === "Heavy"
                              ? "border-warning/30 bg-warning/10 text-warning"
                              : ""
                        }
                      >
                        {prediction.value.label}
                      </Badge>
                      {prediction.value.index}%
                    </span>
                  </div>
                  <Progress value={prediction.value.index} className="h-1.5" />
                  <p className="mt-1 text-xs text-muted-foreground">{prediction.factors[0]}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.08}>
          <Card className="h-full">
            <CardHeader><CardTitle className="text-base">Appointment optimisation</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {optimisation?.value.map((s) => {
                const doc = doctors?.find((d) => d.id === s.doctorId);
                return (
                  <div key={s.doctorId} className="rounded-xl border border-border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{doc?.name}</p>
                      <Badge variant="secondary" className="shrink-0 text-[11px]">{s.gain}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{s.suggestion}</p>
                  </div>
                );
              })}
              <p className="text-xs text-muted-foreground">
                Model: {optimisation?.model} · confidence {Math.round((optimisation?.confidence ?? 0) * 100)}%
              </p>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
