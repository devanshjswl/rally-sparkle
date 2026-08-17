import { Link } from "react-router-dom";
import { CalendarClock, Clock, Siren, Stethoscope, ArrowRight, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  AIPredictionCard,
  EmptyState,
  PageHeader,
  Reveal,
  StatCard,
} from "@/components/hospital/primitives";
import { useAppointments, useDepartments, useDoctors, useEmergencies, useHospitalStats } from "@/hooks/useHospital";
import { opdCrowdForecast, today } from "@/lib/hospital/api";
import { predictCrowd, predictWorkload } from "@/lib/hospital/ai";

export default function AdminOverview() {
  const { data: stats } = useHospitalStats();
  const { data: departments } = useDepartments();
  const { data: doctors } = useDoctors();
  const { data: appointments } = useAppointments({ date: today });
  const { data: emergencies } = useEmergencies();

  const crowd = predictCrowd(opdCrowdForecast);
  const busiest =
    doctors && appointments
      ? doctors
          .map((d) => ({ doctor: d, p: predictWorkload(d, appointments) }))
          .sort((a, b) => b.p.value.index - a.p.value.index)
          .slice(0, 5)
      : [];
  const activeEmergencies = emergencies?.filter((e) => e.status !== "stabilised") ?? [];

  return (
    <div>
      <PageHeader
        title="Hospital operations"
        subtitle="Live OPD load, emergency status and AI forecasts across every department."
        action={
          <Button asChild variant="outline">
            <Link to="/app/admin/analytics">Open analytics <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Reveal><StatCard label="Appointments today" value={stats?.appointmentsToday ?? 0} hint={`${stats?.completed ?? 0} completed`} icon={CalendarClock} tone="primary" /></Reveal>
        <Reveal delay={0.05}><StatCard label="Patients waiting" value={stats?.waiting ?? 0} hint={`avg wait ~${stats?.avgWait ?? 0} min`} icon={Clock} /></Reveal>
        <Reveal delay={0.1}><StatCard label="Doctors on duty" value={`${stats?.doctorsOnDuty ?? 0}/${stats?.totalDoctors ?? 0}`} hint={`${stats?.departments ?? 0} departments`} icon={Stethoscope} tone="success" /></Reveal>
        <Reveal delay={0.15}><StatCard label="Active emergencies" value={activeEmergencies.length} hint="triage board live" icon={Siren} tone="danger" /></Reveal>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base"><Activity className="h-4 w-4" /> Department OPD load</CardTitle>
            <Button asChild variant="ghost" size="sm"><Link to="/app/admin/queues">Live queues</Link></Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {departments?.map((d) => (
              <div key={d.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{d.name}</span>
                  <span className="text-muted-foreground">{d.load}% · {d.rooms} rooms</span>
                </div>
                <Progress value={d.load} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <AIPredictionCard
            title="OPD crowd prediction"
            prediction={crowd}
            primary={`Peak ${crowd.value.peakHour}`}
            footer={<p className="text-xs text-muted-foreground">Plan extra counters before the peak; {crowd.value.quietHour} is the quietest window.</p>}
          />
          <Card>
            <CardHeader><CardTitle className="text-base">Highest workload</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {!busiest.length && <EmptyState title="No load data" />}
              {busiest.map(({ doctor, p }) => (
                <div key={doctor.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">{doctor.name}</span>
                  <Badge variant="secondary" className="shrink-0 text-[11px]">{p.value.index}% {p.value.label}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
