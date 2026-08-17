import { Link } from "react-router-dom";
import { ListOrdered, Clock, CheckCircle2, Siren, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AIPredictionCard,
  EmptyState,
  PageHeader,
  PriorityBadge,
  Reveal,
  StatCard,
} from "@/components/hospital/primitives";
import { useHospitalAuth } from "@/contexts/HospitalAuthContext";
import {
  useAppointments,
  useDoctorQueue,
  useDoctors,
  useEmergencies,
  useToggleDoctorAvailability,
} from "@/hooks/useHospital";
import { today } from "@/lib/hospital/api";
import { predictWorkload } from "@/lib/hospital/ai";

export default function DoctorOverview() {
  const { user } = useHospitalAuth();
  const doctorId = user?.doctorId;
  const { data: doctors } = useDoctors();
  const doctor = doctors?.find((d) => d.id === doctorId);
  const { data: queue } = useDoctorQueue(doctorId);
  const { data: appointments } = useAppointments({ doctorId, date: today });
  const { data: emergencies } = useEmergencies();
  const toggle = useToggleDoctorAvailability();

  const workload = doctor && appointments ? predictWorkload(doctor, appointments) : null;
  const completed = appointments?.filter((a) => a.status === "completed").length ?? 0;
  const myEmergencies = emergencies?.filter((e) => e.assignedDoctorId === doctorId && e.status !== "stabilised") ?? [];

  return (
    <div>
      <PageHeader
        title={`Good day, ${doctor?.name ?? user?.name}`}
        subtitle={`${doctor?.specialization ?? ""} · ${doctor?.room ?? ""} · OPD ${doctor?.slotStart}–${doctor?.slotEnd}`}
        action={
          <div className="flex items-center gap-2 rounded-full border border-border px-3 py-2">
            <Switch
              id="avail"
              checked={!!doctor?.available}
              onCheckedChange={async () => {
                if (!doctorId) return;
                await toggle.mutateAsync(doctorId);
                toast.success(doctor?.available ? "Marked unavailable" : "Marked available");
              }}
            />
            <Label htmlFor="avail" className="text-sm">
              {doctor?.available ? "Available for OPD" : "Not available"}
            </Label>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Reveal><StatCard label="In queue" value={queue?.length ?? 0} hint="waiting + in room" icon={ListOrdered} tone="primary" /></Reveal>
        <Reveal delay={0.05}><StatCard label="Completed today" value={completed} hint="consultations closed" icon={CheckCircle2} tone="success" /></Reveal>
        <Reveal delay={0.1}><StatCard label="Avg consult" value={`${doctor?.avgConsultMinutes ?? 0} min`} hint="rolling average" icon={Clock} /></Reveal>
        <Reveal delay={0.15}><StatCard label="Emergency referrals" value={myEmergencies.length} hint="assigned to you" icon={Siren} tone="danger" /></Reveal>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Next patients</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/app/doctor/queue">Open live queue <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {!queue?.length && <EmptyState title="Queue is clear" hint="No patients waiting right now." />}
            {queue?.slice(0, 5).map((q) => (
              <div key={q.appointment.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 font-display font-bold text-primary">
                  {q.appointment.tokenNumber}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{q.appointment.patientName}</p>
                  <p className="truncate text-xs text-muted-foreground">{q.appointment.reason}</p>
                </div>
                <PriorityBadge priority={q.appointment.priority} />
                <Badge variant="secondary" className="text-[11px]">
                  {q.appointment.status === "in-consultation" ? "In room" : `~${q.etaMinutes} min`}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {workload && (
            <AIPredictionCard
              title="Workload prediction"
              prediction={workload}
              primary={`${workload.value.index}% · ${workload.value.label}`}
              footer={
                <p className="text-xs text-muted-foreground">
                  {workload.value.index > 70
                    ? "Consider moving non-urgent tokens to the afternoon window."
                    : "Load is manageable for the rest of the session."}
                </p>
              }
            />
          )}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4" /> Session summary</CardTitle></CardHeader>
            <CardContent className="space-y-1.5 text-sm text-muted-foreground">
              <p>Booked today: {appointments?.length ?? 0}</p>
              <p>High priority: {appointments?.filter((a) => a.priority !== "normal").length ?? 0}</p>
              <p>Cancelled: {appointments?.filter((a) => a.status === "cancelled").length ?? 0}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
