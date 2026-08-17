import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { PageHeader, Reveal } from "@/components/hospital/primitives";
import { useDepartments, useDoctors, useSaveDepartment } from "@/hooks/useHospital";
import type { Department } from "@/lib/hospital/types";

const empty: Omit<Department, "id"> = {
  name: "",
  description: "",
  icon: "stethoscope",
  openFrom: "09:00",
  openTo: "17:00",
  rooms: 2,
  load: 40,
};

export default function ManageDepartments() {
  const { data: departments } = useDepartments();
  const { data: doctors } = useDoctors();
  const save = useSaveDepartment();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<(Omit<Department, "id"> & { id?: string }) | null>(null);

  const submit = async () => {
    if (!draft?.name) {
      toast.error("Department name is required");
      return;
    }
    await save.mutateAsync(draft);
    toast.success(draft.id ? "Department updated" : "Department created");
    setOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Departments"
        subtitle="OPD departments, timings, rooms and current load."
        action={
          <Button onClick={() => { setDraft({ ...empty }); setOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add department
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {departments?.map((d, i) => {
          const count = doctors?.filter((x) => x.departmentId === d.id).length ?? 0;
          return (
            <Reveal key={d.id} delay={Math.min(i * 0.04, 0.3)}>
              <Card
                className="h-full cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => { setDraft({ ...d }); setOpen(true); }}
              >
                <CardHeader className="space-y-1">
                  <CardTitle className="flex items-center justify-between gap-2 text-base">
                    {d.name}
                    <Badge variant="secondary" className="shrink-0 text-[11px]">
                      <Users className="mr-1 h-3 w-3" /> {count}
                    </Badge>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{d.openFrom}–{d.openTo} · {d.rooms} rooms</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{d.description}</p>
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>Current OPD load</span><span>{d.load}%</span>
                    </div>
                    <Progress value={d.load} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit department" : "Add department"}</DialogTitle>
            <DialogDescription>Departments group doctors and drive crowd forecasting.</DialogDescription>
          </DialogHeader>
          {draft && (
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Cardiology" />
              </div>
              <div>
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="from">Opens</Label>
                  <Input id="from" type="time" value={draft.openFrom} onChange={(e) => setDraft({ ...draft, openFrom: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="to">Closes</Label>
                  <Input id="to" type="time" value={draft.openTo} onChange={(e) => setDraft({ ...draft, openTo: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="rooms">Rooms</Label>
                  <Input id="rooms" type="number" min={1} value={draft.rooms} onChange={(e) => setDraft({ ...draft, rooms: Number(e.target.value) })} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={save.isPending}>Save department</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
