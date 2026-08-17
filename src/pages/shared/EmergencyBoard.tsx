import { motion } from "framer-motion";
import { Siren } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { EmptyState, PageHeader, ease } from "@/components/hospital/primitives";
import { useHospitalAuth } from "@/contexts/HospitalAuthContext";
import { useDepartments, useDoctors, useEmergencies, useUpdateEmergencyStatus } from "@/hooks/useHospital";
import type { EmergencyCase } from "@/lib/hospital/types";

const triageTone: Record<EmergencyCase["triage"], string> = {
  Red: "border-destructive/30 bg-destructive/10 text-destructive",
  Yellow: "border-warning/30 bg-warning/10 text-warning",
  Green: "border-success/30 bg-success/10 text-success",
};

const COLUMNS: { key: EmergencyCase["status"]; title: string; next?: EmergencyCase["status"]; cta?: string }[] = [
  { key: "incoming", title: "Incoming", next: "in-treatment", cta: "Start treatment" },
  { key: "in-treatment", title: "In treatment", next: "stabilised", cta: "Mark stabilised" },
  { key: "stabilised", title: "Stabilised" },
];

export default function EmergencyBoard() {
  const { user } = useHospitalAuth();
  const { data: cases } = useEmergencies();
  const { data: doctors } = useDoctors();
  const { data: departments } = useDepartments();
  const update = useUpdateEmergencyStatus();

  const visible = (cases ?? []).filter((c) =>
    user?.role === "doctor" ? c.assignedDoctorId === user.doctorId || !c.assignedDoctorId : true,
  );

  return (
    <div>
      <PageHeader
        title="Emergency cases"
        subtitle="Red-Yellow-Green triage board. Emergency arrivals bypass OPD tokens and are pushed to the front of the queue."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {COLUMNS.map((col, ci) => {
          const items = visible.filter((c) => c.status === col.key);
          return (
            <motion.div
              key={col.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: ci * 0.06, ease }}
            >
              <Card className="h-full">
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <CardTitle className="flex items-center gap-2 text-base">
                    {col.key === "incoming" && <Siren className="h-4 w-4 text-destructive" />}
                    {col.title}
                  </CardTitle>
                  <Badge variant="secondary">{items.length}</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!items.length && <EmptyState title="Nothing here" />}
                  {items.map((c) => (
                    <div key={c.id} className="rounded-xl border border-border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{c.patientName}</p>
                          <p className="text-xs text-muted-foreground">{c.age} yrs · arrived {c.arrivedAt}</p>
                        </div>
                        <Badge variant="outline" className={`shrink-0 ${triageTone[c.triage]}`}>{c.triage}</Badge>
                      </div>
                      <p className="mt-2 text-sm">{c.condition}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {departments?.find((d) => d.id === c.departmentId)?.name}
                        {c.assignedDoctorId
                          ? ` · ${doctors?.find((d) => d.id === c.assignedDoctorId)?.name}`
                          : " · unassigned"}
                      </p>
                      {col.next && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3 w-full"
                          onClick={async () => {
                            await update.mutateAsync({ id: c.id, status: col.next! });
                            toast.success(`${c.patientName} → ${col.next}`);
                          }}
                        >
                          {col.cta}
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
