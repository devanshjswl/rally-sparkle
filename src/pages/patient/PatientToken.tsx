import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, MapPin, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AIPredictionCard,
  EmptyState,
  PageHeader,
  PriorityBadge,
  StatusBadge,
  ease,
} from "@/components/hospital/primitives";
import { useHospitalAuth } from "@/contexts/HospitalAuthContext";
import { useAppointments, useDoctorQueue, useDoctors } from "@/hooks/useHospital";
import { today } from "@/lib/hospital/api";
import { predictWaitingTime } from "@/lib/hospital/ai";

export default function PatientToken() {
  const { user } = useHospitalAuth();
  const { data: appointments, isLoading } = useAppointments({ patientId: user?.patientId });
  const { data: doctors } = useDoctors();

  const active = appointments?.find(
    (a) => a.date === today && (a.status === "waiting" || a.status === "in-consultation"),
  );
  const doctor = doctors?.find((d) => d.id === active?.doctorId);
  const { data: queue, isFetching, refetch } = useDoctorQueue(active?.doctorId);
  const me = queue?.find((q) => q.appointment.id === active?.id);
  const prediction = queue && active ? predictWaitingTime(queue, active.id, doctor) : null;

  if (isLoading) return <Skeleton className="h-64 w-full rounded-xl" />;

  if (!active)
    return (
      <div>
        <PageHeader title="Live token & queue" subtitle="Your digital token and real-time OPD position." />
        <EmptyState title="No active token today" hint="Book an appointment to get a digital token." />
        <div className="mt-4">
          <Button asChild><Link to="/app/patient/book">Book appointment</Link></Button>
        </div>
      </div>
    );

  const ahead = Math.max(0, (me?.position ?? 1) - 1);
  const total = queue?.length ?? 1;

  return (
    <div>
      <PageHeader
        title="Live token & queue"
        subtitle="Position and waiting time refresh automatically every 15 seconds."
        action={
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease }}
          className="lg:col-span-2"
        >
          <Card className="relative overflow-hidden">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
            <CardContent className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Your token</p>
                  <p className="font-display text-6xl font-bold leading-none text-primary">#{active.tokenNumber}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <StatusBadge status={active.status} />
                    <PriorityBadge priority={active.priority} />
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium">{doctor?.name}</p>
                  <p className="text-muted-foreground">{doctor?.specialization}</p>
                  <p className="mt-2 flex items-center justify-end gap-1 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {doctor?.room}
                  </p>
                  <p className="flex items-center justify-end gap-1 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> Slot {active.slot}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Queue progress</span>
                  <span className="font-medium">
                    {ahead === 0 ? "You're next" : `${ahead} ahead of you`} · {total} in queue
                  </span>
                </div>
                <Progress value={((total - ahead) / total) * 100} className="h-2" />
              </div>

              <div className="mt-6 space-y-2">
                <p className="text-sm font-medium">Queue order (live)</p>
                {queue?.map((q) => {
                  const mine = q.appointment.id === active.id;
                  return (
                    <div
                      key={q.appointment.id}
                      className={`flex items-center gap-3 rounded-xl border p-2.5 text-sm ${mine ? "border-primary/40 bg-primary/5" : "border-border"}`}
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted font-medium">
                        {q.appointment.tokenNumber}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {mine ? "You" : q.appointment.patientName.split(" ")[0] + " " + (q.appointment.patientName.split(" ")[1]?.[0] ?? "") + "."}
                      </span>
                      <PriorityBadge priority={q.appointment.priority} />
                      <Badge variant="secondary" className="text-[11px]">
                        {q.appointment.status === "in-consultation" ? "In room" : `~${q.etaMinutes} min`}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-4">
          {prediction && (
            <AIPredictionCard
              title="Estimated waiting time"
              prediction={prediction}
              primary={prediction.value === 0 ? "You're next" : `${prediction.value} min`}
            />
          )}
          <Card>
            <CardHeader><CardTitle className="text-base">Visit checklist</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>· Reach {doctor?.room} about 10 minutes before your estimate.</p>
              <p>· Carry your UHID and previous prescriptions.</p>
              <p>· Emergency cases can shift the queue — watch this screen for updates.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
