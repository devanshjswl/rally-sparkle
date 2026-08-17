import { motion } from "framer-motion";
import { PlayCircle, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  EmptyState,
  PageHeader,
  PriorityBadge,
  StatusBadge,
  ease,
} from "@/components/hospital/primitives";
import { useHospitalAuth } from "@/contexts/HospitalAuthContext";
import {
  useCallNextPatient,
  useDoctorQueue,
  useDoctors,
  useUpdateAppointmentStatus,
} from "@/hooks/useHospital";

export default function DoctorQueue() {
  const { user } = useHospitalAuth();
  const doctorId = user?.doctorId;
  const { data: doctors } = useDoctors();
  const doctor = doctors?.find((d) => d.id === doctorId);
  const { data: queue, isLoading } = useDoctorQueue(doctorId);
  const callNext = useCallNextPatient();
  const setStatus = useUpdateAppointmentStatus();

  const current = queue?.find((q) => q.appointment.status === "in-consultation");
  const waiting = queue?.filter((q) => q.appointment.status === "waiting") ?? [];

  return (
    <div>
      <PageHeader
        title="Live queue"
        subtitle="Ordered by AI triage priority, then token number. Updates every 15 seconds."
        action={
          <Button
            onClick={async () => {
              if (!doctorId) return;
              const next = await callNext.mutateAsync(doctorId);
              toast.success(next ? `Called token #${next.tokenNumber} — ${next.patientName}` : "Queue is empty");
            }}
            disabled={callNext.isPending || !waiting.length}
          >
            {callNext.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlayCircle className="mr-2 h-4 w-4" />}
            Call next patient
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease }}>
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader><CardTitle className="text-base">In consultation</CardTitle></CardHeader>
            <CardContent>
              {current ? (
                <div className="space-y-3">
                  <p className="font-display text-4xl font-bold text-primary">#{current.appointment.tokenNumber}</p>
                  <div>
                    <p className="font-medium">{current.appointment.patientName}</p>
                    <p className="text-sm text-muted-foreground">{current.appointment.reason}</p>
                  </div>
                  <div className="flex gap-2">
                    <PriorityBadge priority={current.appointment.priority} />
                    <Badge variant="secondary" className="text-[11px]">Slot {current.appointment.slot}</Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={async () => {
                      await setStatus.mutateAsync({ id: current.appointment.id, status: "completed" });
                      toast.success("Consultation completed");
                    }}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Mark completed
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No patient in the room. Call the next token.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              Waiting ({waiting.length}) · {doctor?.room}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading && <p className="text-sm text-muted-foreground">Loading queue…</p>}
            {!isLoading && !waiting.length && <EmptyState title="No one waiting" hint="All tokens for this session are handled." />}
            {waiting.map((q, i) => (
              <motion.div
                key={q.appointment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.25), ease }}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted font-display font-bold">
                  {q.appointment.tokenNumber}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{q.appointment.patientName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {q.appointment.reason} · slot {q.appointment.slot}
                  </p>
                </div>
                <PriorityBadge priority={q.appointment.priority} />
                <Badge variant="secondary" className="text-[11px]">~{q.etaMinutes} min</Badge>
                <StatusBadge status={q.appointment.status} />
                <Button
                  size="icon"
                  variant="ghost"
                  title="Mark as no-show / cancel"
                  onClick={async () => {
                    await setStatus.mutateAsync({ id: q.appointment.id, status: "cancelled" });
                    toast.success("Token cancelled");
                  }}
                >
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </Button>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
