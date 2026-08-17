import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Star, MapPin, IndianRupee, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { EmptyState, PageHeader, Reveal } from "@/components/hospital/primitives";
import { useDepartments, useDoctors } from "@/hooks/useHospital";

export default function FindDoctors() {
  const [query, setQuery] = useState("");
  const [departmentId, setDepartmentId] = useState<string | undefined>();
  const [availableOnly, setAvailableOnly] = useState(false);
  const { data: departments } = useDepartments();
  const { data: doctors, isLoading } = useDoctors({ query, departmentId, availableOnly });

  return (
    <div>
      <PageHeader
        title="Find doctors & departments"
        subtitle="Search by name, specialisation or department, then book directly."
      />

      <Card className="mb-5">
        <CardContent className="space-y-4 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search doctor, specialisation or department…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              onClick={() => setDepartmentId(undefined)}
              variant={departmentId ? "outline" : "default"}
              className="cursor-pointer"
            >
              All departments
            </Badge>
            {departments?.map((d) => (
              <Badge
                key={d.id}
                onClick={() => setDepartmentId(d.id)}
                variant={departmentId === d.id ? "default" : "outline"}
                className="cursor-pointer"
              >
                {d.name}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Switch id="avail" checked={availableOnly} onCheckedChange={setAvailableOnly} />
            <Label htmlFor="avail" className="text-sm text-muted-foreground">Available today only</Label>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
        </div>
      )}

      {!isLoading && !doctors?.length && (
        <EmptyState title="No doctors match this search" hint="Try another department or clear the filters." />
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {doctors?.map((d, i) => {
          const dep = departments?.find((x) => x.id === d.departmentId);
          return (
            <Reveal key={d.id} delay={Math.min(i * 0.04, 0.3)}>
              <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
                <CardContent className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-lg font-semibold">{d.name}</h3>
                      <p className="truncate text-sm text-muted-foreground">{d.specialization}</p>
                    </div>
                    <Badge variant={d.available ? "secondary" : "outline"} className="shrink-0 text-[11px]">
                      {d.available ? "Available" : "On leave"}
                    </Badge>
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground">
                    {dep?.name} · {d.qualification} · {d.experienceYears} yrs
                  </p>

                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-warning" /> {d.rating}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {d.room}</span>
                    <span className="flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5" /> {d.fee || "Free"}</span>
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground">
                    OPD: {d.days.join(", ")} · {d.slotStart}–{d.slotEnd}
                  </p>

                  <Button asChild size="sm" className="mt-4 w-full" disabled={!d.available}>
                    <Link to={`/app/patient/book?doctor=${d.id}`}>
                      <CalendarPlus className="mr-2 h-4 w-4" /> Book appointment
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
