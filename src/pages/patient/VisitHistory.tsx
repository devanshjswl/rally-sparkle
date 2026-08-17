import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState, PageHeader, PriorityBadge, StatusBadge } from "@/components/hospital/primitives";
import { useHospitalAuth } from "@/contexts/HospitalAuthContext";
import { useAppointments, useDepartments, useDoctors } from "@/hooks/useHospital";

export default function VisitHistory() {
  const { user } = useHospitalAuth();
  const { data: appointments, isLoading } = useAppointments({ patientId: user?.patientId });
  const { data: doctors } = useDoctors();
  const { data: departments } = useDepartments();

  const rows = [...(appointments ?? [])].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div>
      <PageHeader title="Visit history" subtitle="Every appointment, token and consultation outcome on your record." />
      <Card>
        <CardContent className="p-0">
          {isLoading && <div className="space-y-2 p-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}
          {!isLoading && !rows.length && <div className="p-6"><EmptyState title="No visits recorded yet" /></div>}
          {!!rows.length && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Token</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead className="hidden md:table-cell">Department</TableHead>
                    <TableHead className="hidden lg:table-cell">Reason</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {a.date}
                        <span className="block text-xs text-muted-foreground">{a.slot}</span>
                      </TableCell>
                      <TableCell className="font-medium">#{a.tokenNumber}</TableCell>
                      <TableCell className="text-sm">{doctors?.find((d) => d.id === a.doctorId)?.name ?? "—"}</TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                        {departments?.find((d) => d.id === a.departmentId)?.name ?? "—"}
                      </TableCell>
                      <TableCell className="hidden max-w-[220px] truncate text-sm text-muted-foreground lg:table-cell">
                        {a.reason}
                      </TableCell>
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
