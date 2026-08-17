import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { AIPredictionCard, PageHeader, PriorityBadge } from "@/components/hospital/primitives";
import { useHospitalAuth } from "@/contexts/HospitalAuthContext";
import {
  useAvailableSlots,
  useBookAppointment,
  useDepartments,
  useDoctors,
  usePatients,
} from "@/hooks/useHospital";
import { today } from "@/lib/hospital/api";
import { predictPriority } from "@/lib/hospital/ai";

export default function BookAppointment() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useHospitalAuth();
  const { data: departments } = useDepartments();
  const { data: doctors } = useDoctors();
  const { data: patients } = usePatients();
  const book = useBookAppointment();

  const preset = params.get("doctor") ?? undefined;
  const presetDept = doctors?.find((d) => d.id === preset)?.departmentId;

  const [departmentId, setDepartmentId] = useState<string | undefined>(presetDept);
  const [doctorId, setDoctorId] = useState<string | undefined>(preset);
  const [date, setDate] = useState(today);
  const [slot, setSlot] = useState<string | undefined>();
  const [reason, setReason] = useState("");

  const deptDoctors = useMemo(
    () => doctors?.filter((d) => (departmentId ? d.departmentId === departmentId : true) && d.available) ?? [],
    [doctors, departmentId],
  );
  const { data: slots, isLoading: slotsLoading } = useAvailableSlots(doctorId, date);
  const patient = patients?.find((p) => p.id === user?.patientId);
  const triage = predictPriority({ age: patient?.age ?? 30, reason });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId || !slot) {
      toast.error("Pick a doctor and a time slot");
      return;
    }
    const appointment = await book.mutateAsync({
      patientId: user?.patientId ?? "pat-1",
      patientName: user?.name ?? "Patient",
      doctorId,
      date,
      slot,
      reason,
      priority: triage.value,
    });
    toast.success(`Token #${appointment.tokenNumber} confirmed for ${date} at ${slot}`);
    navigate("/app/patient/token");
  };

  return (
    <div>
      <PageHeader
        title="Book an appointment"
        subtitle="Pick a department, doctor and slot. A digital token is issued instantly."
      />

      <form onSubmit={submit} className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Appointment details</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Select
                  value={departmentId}
                  onValueChange={(v) => {
                    setDepartmentId(v);
                    setDoctorId(undefined);
                    setSlot(undefined);
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {departments?.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Doctor</Label>
                <Select
                  value={doctorId}
                  onValueChange={(v) => {
                    setDoctorId(v);
                    setSlot(undefined);
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                  <SelectContent>
                    {deptDoctors.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name} — {d.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  min={today}
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setSlot(undefined);
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reason">Reason / symptoms</Label>
                <Input
                  id="reason"
                  placeholder="e.g. chest pain since morning"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Available slots</Label>
              {!doctorId && <p className="text-sm text-muted-foreground">Select a doctor to see open slots.</p>}
              {doctorId && slotsLoading && (
                <div className="flex flex-wrap gap-2">
                  {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-9 w-20 rounded-full" />)}
                </div>
              )}
              {doctorId && !slotsLoading && (
                <div className="flex flex-wrap gap-2">
                  {slots?.length ? (
                    slots.map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setSlot(s)}
                        className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                          slot === s
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary/50 hover:bg-primary/5"
                        }`}
                      >
                        {s}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No slots left for this date.</p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Additional notes (optional)</Label>
              <Textarea id="notes" rows={3} placeholder="Ongoing medication, allergies, previous reports…" />
            </div>

            <Button type="submit" className="w-full sm:w-auto" disabled={book.isPending}>
              {book.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm & generate token
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <AIPredictionCard
            title="AI triage priority"
            prediction={triage}
            primary={<PriorityBadge priority={triage.value} />}
            footer={
              <p className="text-xs text-muted-foreground">
                Priority is re-evaluated by the nurse station before consultation.
              </p>
            }
          />
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4 text-primary" /> Smart slot tip</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Afternoon slots (14:00–16:00) usually clear 12–18 minutes faster than the 10:00 peak.</p>
              {patient && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <Badge variant="outline">{patient.uhid}</Badge>
                  <Badge variant="outline">{patient.age} yrs</Badge>
                  <Badge variant="outline">{patient.bloodGroup}</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
