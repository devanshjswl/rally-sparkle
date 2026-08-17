import { Link } from "react-router-dom";
import { CalendarPlus, Clock, Search, Ticket, History, ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, Reveal, StatCard, StatusBadge, EmptyState, AIPredictionCard } from "@/components/hospital/primitives";
import { useHospitalAuth } from "@/contexts/HospitalAuthContext";
import { useAppointments, useDepartments, useDoctorQueue, useDoctors } from "@/hooks/useHospital";
import { today } from "@/lib/hospital/api";
import { predictWaitingTime } from "@/lib/hospital/ai";

export default function PatientOverview() {
  const { user } = useHospitalAuth();
  const patientId = user?.patientId;
  const { data: appointments, isLoading } = useAppointments({ patientId });
  const { data: doctors } = useDoctors();
  const { data: departments } = useDepartments();

  const upcoming = appointments?.find((a) => a.date >= today && a.status !== "cancelled" && a.status !== "completed");
  const { data: queue } = useDoctorQueue(upcoming?.doctorId);
  const doctor = doctors?.find((d) => d.id === upcoming?.doctorId);
  const prediction = queue && upcoming ? predictWaitingTime(queue, upcoming.id, doctor) : null;
  const past = appointments?.filter((a) => a.status === "completed") ?? [];

  return (
    <div>
      <PageHeader
        title={`Namaste, ${user?.name?.split(" ")[0] ?? "there"}`}
        subtitle="Your appointments, live token status and AI-estimated waiting time in one place."
        action={
          <Button asChild>
            <Link to="/app/patient/book">
              <CalendarPlus className="mr-2 h-4 w-4" /> Book appointment
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Reveal><StatCard label="Active token" value={upcoming ? `#${upcoming.tokenNumber}` : "—"} hint={upcoming ? doctor?.name : "No active appointment"} icon={Ticket} tone="primary" /></Reveal>
        <Reveal delay={0.05}><StatCard label="Predicted wait" value={prediction ? `${prediction.value} min` : "—"} hint={prediction ? `${Math.round(prediction.confidence * 100)}% confidence` : "Book to see an estimate"} icon={Clock} tone="warning" /></Reveal>
        <Reveal delay={0.1}><StatCard label="Ahead of you" value={queue && upcoming ? Math.max(0, (queue.find((q) => q.appointment.id === upcoming.id)?.position ?? 1) - 1) : "—"} hint="patients in queue" icon={Users} /></Reveal>
        <Reveal delay={0.15}><StatCard label="Past visits" value={past.length} hint="completed consultations" icon={History} tone="success" /></Reveal>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Your appointments</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/app/patient/history">View all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading && [0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            {!isLoading && !appointments?.length && (
              <EmptyState title="No appointments yet" hint="Search a department and book your first slot." />
            )}
            {appointments?.slice(0, 4).map((a) => {
              const d = doctors?.find((x) => x.id === a.doctorId);
              const dep = departments?.find((x) => x.id === a.departmentId);
              return (
                <div key={a.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 font-display font-bold text-primary">
                    {a.tokenNumber}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{d?.name ?? "Doctor"}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {dep?.name} · {a.date} at {a.slot} · {a.reason}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {prediction ? (
            <AIPredictionCard
              title="Waiting-time prediction"
              prediction={prediction}
              primary={`${prediction.value} min`}
              footer={
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to="/app/patient/token">Open live queue</Link>
                </Button>
              }
            />
          ) : (
            <Card>
              <CardHeader><CardTitle className="text-base">No live token</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Book an appointment to receive a digital token and a live waiting estimate.</p>
                <Button asChild size="sm" className="w-full"><Link to="/app/patient/book">Book now</Link></Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-base">Quick actions</CardTitle></CardHeader>
            <CardContent className="grid gap-2">
              <Button asChild variant="outline" className="justify-start"><Link to="/app/patient/doctors"><Search className="mr-2 h-4 w-4" /> Find a doctor</Link></Button>
              <Button asChild variant="outline" className="justify-start"><Link to="/app/patient/token"><Ticket className="mr-2 h-4 w-4" /> My token & queue</Link></Button>
              <Button asChild variant="outline" className="justify-start"><Link to="/app/patient/history"><History className="mr-2 h-4 w-4" /> Visit history</Link></Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
