import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { EmptyState, PageHeader } from "@/components/hospital/primitives";
import { useDepartments, useDoctors, useSaveDoctor, useToggleDoctorAvailability } from "@/hooks/useHospital";
import type { Doctor } from "@/lib/hospital/types";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const emptyDoctor = (departmentId: string): Omit<Doctor, "id"> => ({
  name: "",
  departmentId,
  specialization: "",
  qualification: "MBBS, MD",
  experienceYears: 5,
  rating: 4.5,
  fee: 500,
  room: "OPD-",
  available: true,
  days: ["Mon", "Wed", "Fri"],
  slotStart: "09:00",
  slotEnd: "13:00",
  avgConsultMinutes: 10,
});

export default function ManageDoctors() {
  const { data: doctors } = useDoctors();
  const { data: departments } = useDepartments();
  const save = useSaveDoctor();
  const toggle = useToggleDoctorAvailability();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<(Omit<Doctor, "id"> & { id?: string }) | null>(null);

  const rows = (doctors ?? []).filter((d) =>
    q.trim() ? `${d.name} ${d.specialization}`.toLowerCase().includes(q.toLowerCase()) : true,
  );

  const openNew = () => {
    setDraft(emptyDoctor(departments?.[0]?.id ?? ""));
    setOpen(true);
  };

  const submit = async () => {
    if (!draft?.name || !draft.departmentId) {
      toast.error("Name and department are required");
      return;
    }
    await save.mutateAsync(draft);
    toast.success(draft.id ? "Doctor updated" : "Doctor added");
    setOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Doctors"
        subtitle="Add doctors, set OPD windows, consultation time and availability."
        action={<Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Add doctor</Button>}
      />

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search doctors" className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          {!rows.length ? (
            <div className="p-6"><EmptyState title="No doctors found" /></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doctor</TableHead>
                    <TableHead className="hidden md:table-cell">Department</TableHead>
                    <TableHead className="hidden lg:table-cell">OPD window</TableHead>
                    <TableHead className="hidden xl:table-cell">Days</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead className="text-right">Available</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((d) => (
                    <TableRow
                      key={d.id}
                      className="cursor-pointer"
                      onClick={() => {
                        setDraft({ ...d });
                        setOpen(true);
                      }}
                    >
                      <TableCell>
                        <span className="font-medium">{d.name}</span>
                        <span className="block text-xs text-muted-foreground">{d.specialization} · {d.experienceYears} yrs</span>
                      </TableCell>
                      <TableCell className="hidden text-sm md:table-cell">
                        {departments?.find((x) => x.id === d.departmentId)?.name}
                      </TableCell>
                      <TableCell className="hidden whitespace-nowrap text-sm lg:table-cell">
                        {d.slotStart}–{d.slotEnd} · {d.avgConsultMinutes} min
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {d.days.map((x) => <Badge key={x} variant="secondary" className="text-[10px]">{x}</Badge>)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{d.room}</TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <Switch
                          checked={d.available}
                          onCheckedChange={async () => {
                            await toggle.mutateAsync(d.id);
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit doctor" : "Add doctor"}</DialogTitle>
            <DialogDescription>Schedules drive token generation and AI wait predictions.</DialogDescription>
          </DialogHeader>
          {draft && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="dname">Full name</Label>
                <Input id="dname" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Dr. Ananya Rao" />
              </div>
              <div>
                <Label>Department</Label>
                <Select value={draft.departmentId} onValueChange={(v) => setDraft({ ...draft, departmentId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {departments?.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="spec">Specialization</Label>
                <Input id="spec" value={draft.specialization} onChange={(e) => setDraft({ ...draft, specialization: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="qual">Qualification</Label>
                <Input id="qual" value={draft.qualification} onChange={(e) => setDraft({ ...draft, qualification: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="room">Room</Label>
                <Input id="room" value={draft.room} onChange={(e) => setDraft({ ...draft, room: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="start">OPD from</Label>
                <Input id="start" type="time" value={draft.slotStart} onChange={(e) => setDraft({ ...draft, slotStart: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="end">OPD to</Label>
                <Input id="end" type="time" value={draft.slotEnd} onChange={(e) => setDraft({ ...draft, slotEnd: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="cons">Avg consult (min)</Label>
                <Input id="cons" type="number" min={5} value={draft.avgConsultMinutes} onChange={(e) => setDraft({ ...draft, avgConsultMinutes: Number(e.target.value) })} />
              </div>
              <div>
                <Label htmlFor="fee">Fee (₹)</Label>
                <Input id="fee" type="number" min={0} value={draft.fee} onChange={(e) => setDraft({ ...draft, fee: Number(e.target.value) })} />
              </div>
              <div>
                <Label htmlFor="exp">Experience (yrs)</Label>
                <Input id="exp" type="number" min={0} value={draft.experienceYears} onChange={(e) => setDraft({ ...draft, experienceYears: Number(e.target.value) })} />
              </div>
              <div className="flex items-end gap-2">
                <Switch id="av" checked={draft.available} onCheckedChange={(v) => setDraft({ ...draft, available: v })} />
                <Label htmlFor="av">Available</Label>
              </div>
              <div className="sm:col-span-2">
                <Label>OPD days</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {DAYS.map((day) => {
                    const on = draft.days.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            days: on ? draft.days.filter((x) => x !== day) : [...draft.days, day],
                          })
                        }
                        className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                          on ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={save.isPending}>Save doctor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
