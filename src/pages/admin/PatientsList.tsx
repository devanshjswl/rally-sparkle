import { useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState, PageHeader } from "@/components/hospital/primitives";
import { useAppointments, usePatients } from "@/hooks/useHospital";

export default function PatientsList() {
  const [q, setQ] = useState("");
  const { data: patients } = usePatients();
  const { data: appointments } = useAppointments();

  const rows = (patients ?? []).filter((p) =>
    q.trim() ? `${p.name} ${p.uhid} ${p.phone}`.toLowerCase().includes(q.toLowerCase()) : true,
  );

  return (
    <div>
      <PageHeader title="Patients" subtitle="Registered patient records with UHID and visit counts." />

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, UHID or phone" className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          {!rows.length ? (
            <div className="p-6"><EmptyState title="No patients found" /></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>UHID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead className="hidden md:table-cell">Age / gender</TableHead>
                    <TableHead className="hidden lg:table-cell">Phone</TableHead>
                    <TableHead>Blood group</TableHead>
                    <TableHead className="text-right">Visits</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="whitespace-nowrap font-mono text-xs">{p.uhid}</TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground md:table-cell">{p.age} · {p.gender}</TableCell>
                      <TableCell className="hidden text-sm lg:table-cell">{p.phone}</TableCell>
                      <TableCell><Badge variant="secondary">{p.bloodGroup}</Badge></TableCell>
                      <TableCell className="text-right text-sm">
                        {appointments?.filter((a) => a.patientId === p.id).length ?? 0}
                      </TableCell>
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
