import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  EmptyState,
  PageHeader,
  PriorityBadge,
  Reveal,
  StatusBadge,
} from "@/components/hospital/primitives";
import { useHospitalAuth } from "@/contexts/HospitalAuthContext";
import { useAppointments, useAvailableSlots, useDoctors } from "@/hooks/useHospital";
import { today } from "@/lib/hospital/api";

export default function DoctorSchedule() {
  const { user } = useHospitalAuth();
  const doctorId = user?.doctorId;
  const { data: doctors } = useDoctors();
  const doctor = doctors?.find((d) => d.id === doctorId);
  const { data: appointments } = useAppointments({ doctorId, date: today });
  const { data: freeSlots } = useAvailableSlots(doctorId, today);

  const booked = [...(appointments ?? [])].sort((a, b) => a.slot.localeCompare(b.slot));
  const capacity = booked.length + (freeSlots?.length ?? 0);
  const utilisation = capacity ? Math.round((booked.length / capacity) * 100) : 0;

  return (
    <div>
      <PageHeader
        title="My schedule"
        subtitle={`OPD ${doctor?.slotStart}–${doctor?.slotEnd} · ${doctor?.avgConsultMinutes} min per patient · ${doctor?.room}`}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Reveal>
          <Card className="h-full">
            <CardHeader><CardTitle className="text-base">Session utilisation</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-display text-4xl font-bold">{utilisation}%</p>
                <p className="text-sm text-muted-foreground">{booked.length} of {capacity} slots booked</p>
              </div>
              <Progress value={utilisation} className="h-2" />
              <div className="flex flex-wrap gap-1.5">
                {doctor?.days.map((d) => (
                  <Badge key={d} variant="secondary" className="text-[11px]">{d}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.06} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader><CardTitle className="text-base">Free slots today</CardTitle></CardHeader>
            <CardContent>
              {!freeSlots?.length && <EmptyState title="Fully booked" hint="No open slots left in this session." />}
              <div className="flex flex-wrap gap-2">
                {freeSlots?.map((s) => (
                  <span key={s} className="rounded-lg border border-border px-3 py-1.5 text-sm">{s}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </div>

      <Card className="mt-4">
        <CardHeader><CardTitle className="text-base">Today's appointments</CardTitle></CardHeader>
        <CardContent className="p-0">
          {!booked.length ? (
            <div className="p-6"><EmptyState title="No appointments today" /></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Slot</TableHead>
                    <TableHead>Token</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead className="hidden md:table-cell">Reason</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {booked.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="whitespace-nowrap font-medium">{a.slot}</TableCell>
                      <TableCell>#{a.tokenNumber}</TableCell>
                      <TableCell className="text-sm">{a.patientName}</TableCell>
                      <TableCell className="hidden max-w-[240px] truncate text-sm text-muted-foreground md:table-cell">{a.reason}</TableCell>
                      <TableCell><PriorityBadge priority={a.priority} /></TableCell>
                      <TableCell className="text-right"><StatusBadge status={a.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
