import { useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState, PageHeader, PriorityBadge, StatusBadge } from "@/components/hospital/primitives";
import { useAppointments, useDepartments, useDoctors } from "@/hooks/useHospital";
import type { AppointmentStatus } from "@/lib/hospital/types";

export default function AllAppointments() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<AppointmentStatus | "all">("all");
  const [dept, setDept] = useState("all");
  const { data: appointments } = useAppointments();
  const { data: doctors } = useDoctors();
  const { data: departments } = useDepartments();

  const rows = (appointments ?? [])
    .filter((a) => (status === "all" ? true : a.status === status))
    .filter((a) => (dept === "all" ? true : a.departmentId === dept))
    .filter((a) =>
      q.trim()
        ? [a.patientName, a.reason, String(a.tokenNumber)].join(" ").toLowerCase().includes(q.toLowerCase())
        : true,
    )
    .sort((a, b) => (a.date === b.date ? a.slot.localeCompare(b.slot) : a.date < b.date ? 1 : -1));

  return (
    <div>
      <PageHeader title="Appointments" subtitle="All OPD bookings across departments with token, priority and status." />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patient, token or reason" className="pl-9" />
        </div>
        <Select value={dept} onValueChange={setDept}>
          <SelectTrigger className="w-[190px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {departments?.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v as AppointmentStatus | "all")}>
          <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="waiting">Waiting</SelectItem>
            <SelectItem value="in-consultation">In consultation</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {!rows.length ? (
            <div className="p-6"><EmptyState title="No appointments match" hint="Try clearing the filters." /></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead className="hidden md:table-cell">Doctor</TableHead>
                    <TableHead className="hidden lg:table-cell">Department</TableHead>
                    <TableHead>Date / slot</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">#{a.tokenNumber}</TableCell>
                      <TableCell className="text-sm">
                        {a.patientName}
                        <span className="block max-w-[200px] truncate text-xs text-muted-foreground">{a.reason}</span>
                      </TableCell>
                      <TableCell className="hidden text-sm md:table-cell">{doctors?.find((d) => d.id === a.doctorId)?.name}</TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                        {departments?.find((d) => d.id === a.departmentId)?.name}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {a.date}
                        <span className="block text-xs text-muted-foreground">{a.slot}</span>
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
