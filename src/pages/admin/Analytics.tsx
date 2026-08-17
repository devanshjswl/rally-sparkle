import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CalendarClock, Clock, Siren, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader, Reveal, StatCard } from "@/components/hospital/primitives";
import { useAppointments, useDepartments, useDoctors, useHospitalStats } from "@/hooks/useHospital";
import { weeklyFootfall } from "@/lib/hospital/api";

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
  fontSize: 12,
};

const SLICE = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))"];

export default function Analytics() {
  const { data: stats } = useHospitalStats();
  const { data: appointments } = useAppointments();
  const { data: departments } = useDepartments();
  const { data: doctors } = useDoctors();

  const byDepartment = (departments ?? []).map((d) => ({
    name: d.name,
    appointments: appointments?.filter((a) => a.departmentId === d.id).length ?? 0,
    doctors: doctors?.filter((x) => x.departmentId === d.id).length ?? 0,
  }));

  const statusSplit = (["waiting", "in-consultation", "completed", "cancelled"] as const).map((s) => ({
    name: s === "in-consultation" ? "In consultation" : s[0].toUpperCase() + s.slice(1),
    value: appointments?.filter((a) => a.status === s).length ?? 0,
  }));

  const weeklyTotal = weeklyFootfall.reduce((s, d) => s + d.opd, 0);

  return (
    <div>
      <PageHeader title="Hospital analytics" subtitle="OPD footfall, department load, consultation outcomes and emergency volume." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Reveal><StatCard label="Weekly OPD footfall" value={weeklyTotal} hint="last 7 days" icon={TrendingUp} tone="primary" /></Reveal>
        <Reveal delay={0.05}><StatCard label="Appointments today" value={stats?.appointmentsToday ?? 0} hint={`${stats?.completed ?? 0} completed`} icon={CalendarClock} /></Reveal>
        <Reveal delay={0.1}><StatCard label="Avg predicted wait" value={`${stats?.avgWait ?? 0} min`} hint="across waiting tokens" icon={Clock} tone="success" /></Reveal>
        <Reveal delay={0.15}><StatCard label="Emergency cases (wk)" value={weeklyFootfall.reduce((s, d) => s + d.emergency, 0)} hint="triage admissions" icon={Siren} tone="danger" /></Reveal>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Weekly footfall — OPD vs emergency</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyFootfall}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="opd" name="OPD" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                <Bar dataKey="emergency" name="Emergency" fill="hsl(var(--destructive))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Appointment outcomes</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusSplit} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {statusSplit.map((_, i) => <Cell key={i} fill={SLICE[i % SLICE.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader><CardTitle className="text-base">Department performance</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {byDepartment.map((d) => {
            const max = Math.max(1, ...byDepartment.map((x) => x.appointments));
            return (
              <div key={d.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{d.name}</span>
                  <span className="text-muted-foreground">{d.appointments} appointments · {d.doctors} doctors</span>
                </div>
                <Progress value={(d.appointments / max) * 100} className="h-1.5" />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
