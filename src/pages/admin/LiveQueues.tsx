import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { EmptyState, PageHeader, PriorityBadge, Reveal } from "@/components/hospital/primitives";
import { useCallNextPatient, useDepartments, useDoctorQueue, useDoctors } from "@/hooks/useHospital";

function DoctorQueueCard({ doctorId, name, room, department }: { doctorId: string; name: string; room: string; department?: string }) {
  const { data: queue } = useDoctorQueue(doctorId);
  const callNext = useCallNextPatient();
  const current = queue?.find((q) => q.appointment.status === "in-consultation");
  const waiting = queue?.filter((q) => q.appointment.status === "waiting") ?? [];

  return (
    <Card className="h-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base">{name}</CardTitle>
        <p className="text-xs text-muted-foreground">{department} · {room}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
          <div>
            <p className="text-xs text-muted-foreground">Now serving</p>
            <p className="font-display text-2xl font-bold text-primary">
              {current ? `#${current.appointment.tokenNumber}` : "—"}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-muted-foreground">Waiting</p>
            <p className="font-display text-2xl font-bold">{waiting.length}</p>
          </div>
        </div>
        <div className="space-y-2">
          {!waiting.length && <EmptyState title="Queue clear" />}
          {waiting.slice(0, 3).map((q) => (
            <div key={q.appointment.id} className="flex items-center gap-2 text-sm">
              <span className="w-8 shrink-0 font-medium">#{q.appointment.tokenNumber}</span>
              <span className="min-w-0 flex-1 truncate">{q.appointment.patientName}</span>
              <PriorityBadge priority={q.appointment.priority} />
              <Badge variant="secondary" className="shrink-0 text-[11px]">~{q.etaMinutes}m</Badge>
            </div>
          ))}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          disabled={!waiting.length || callNext.isPending}
          onClick={async () => {
            const next = await callNext.mutateAsync(doctorId);
            toast.success(next ? `Called #${next.tokenNumber} for ${name}` : "Queue empty");
          }}
        >
          Call next
        </Button>
      </CardContent>
    </Card>
  );
}

export default function LiveQueues() {
  const [dept, setDept] = useState("all");
  const { data: departments } = useDepartments();
  const { data: doctors } = useDoctors();
  const visible = (doctors ?? []).filter((d) => dept === "all" || d.departmentId === dept);

  return (
    <div>
      <PageHeader
        title="Live OPD queues"
        subtitle="Every consultation room in one board, refreshed automatically."
        action={
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {departments?.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((d, i) => (
          <Reveal key={d.id} delay={Math.min(i * 0.04, 0.3)}>
            <DoctorQueueCard
              doctorId={d.id}
              name={d.name}
              room={d.room}
              department={departments?.find((x) => x.id === d.departmentId)?.name}
            />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
