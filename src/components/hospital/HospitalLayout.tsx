import { useMemo } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  CalendarPlus,
  Ticket,
  History,
  Users,
  Stethoscope,
  Building2,
  Siren,
  BarChart3,
  Brain,
  LogOut,
  CalendarClock,
  ListOrdered,
  HeartPulse,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useHospitalAuth } from "@/contexts/HospitalAuthContext";
import type { Role } from "@/lib/hospital/types";

const NAV: Record<Role, { label: string; items: { title: string; url: string; icon: any }[] }[]> = {
  patient: [
    {
      label: "My care",
      items: [
        { title: "Overview", url: "/app/patient", icon: LayoutDashboard },
        { title: "Live token & queue", url: "/app/patient/token", icon: Ticket },
        { title: "Book appointment", url: "/app/patient/book", icon: CalendarPlus },
        { title: "Find doctors", url: "/app/patient/doctors", icon: Search },
        { title: "Visit history", url: "/app/patient/history", icon: History },
      ],
    },
    { label: "Intelligence", items: [{ title: "AI insights", url: "/app/patient/ai", icon: Brain }] },
  ],
  doctor: [
    {
      label: "Consultation",
      items: [
        { title: "Overview", url: "/app/doctor", icon: LayoutDashboard },
        { title: "Live queue", url: "/app/doctor/queue", icon: ListOrdered },
        { title: "My schedule", url: "/app/doctor/schedule", icon: CalendarClock },
        { title: "Emergency cases", url: "/app/doctor/emergency", icon: Siren },
      ],
    },
    { label: "Intelligence", items: [{ title: "AI insights", url: "/app/doctor/ai", icon: Brain }] },
  ],
  admin: [
    {
      label: "Operations",
      items: [
        { title: "Overview", url: "/app/admin", icon: LayoutDashboard },
        { title: "Live OPD queues", url: "/app/admin/queues", icon: ListOrdered },
        { title: "Appointments", url: "/app/admin/appointments", icon: CalendarClock },
        { title: "Emergency board", url: "/app/admin/emergency", icon: Siren },
      ],
    },
    {
      label: "Hospital setup",
      items: [
        { title: "Doctors", url: "/app/admin/doctors", icon: Stethoscope },
        { title: "Departments", url: "/app/admin/departments", icon: Building2 },
        { title: "Patients", url: "/app/admin/patients", icon: Users },
      ],
    },
    {
      label: "Intelligence",
      items: [
        { title: "Analytics", url: "/app/admin/analytics", icon: BarChart3 },
        { title: "AI insights", url: "/app/admin/ai", icon: Brain },
      ],
    },
  ],
};

const ROLE_LABEL: Record<Role, string> = {
  patient: "Patient",
  doctor: "Doctor",
  admin: "Admin / Nurse",
};

function HospitalSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;
  const { user, signOut } = useHospitalAuth();
  const navigate = useNavigate();
  const groups = useMemo(() => (user ? NAV[user.role] : []), [user]);

  const close = () => isMobile && setOpenMobile(false);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className={collapsed ? "p-2" : "p-4"}>
        <NavLink to={user ? `/app/${user.role}` : "/"} className="flex items-center gap-2" onClick={close}>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <HeartPulse className="h-4 w-4" />
          </span>
          {!collapsed && (
            <span className="font-display text-base font-bold leading-tight text-sidebar-foreground">
              Aarogya<span className="text-primary">AI</span>
            </span>
          )}
        </NavLink>
      </SidebarHeader>

      <SidebarContent className="scrollbar-none">
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink
                        to={item.url}
                        end={item.url.split("/").length === 3}
                        className="rounded-lg transition-colors hover:bg-sidebar-accent/60"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                        onClick={close}
                      >
                        <item.icon className="mr-2 h-4 w-4 shrink-0" />
                        {!collapsed && <span className="truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && user && (
          <div className="space-y-2 rounded-xl border border-sidebar-border p-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-xs text-primary">
                  {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="ml-auto flex items-center gap-2">
  {user && (
    <Badge variant="outline" className="hidden text-[11px] sm:inline-flex">
      {ROLE_LABEL[user.role]} view
    </Badge>
  )}
  <ThemeToggle />
  <Avatar className="h-8 w-8">
    ...
  </Avatar>
</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground"
              onClick={() => {
                close();
                signOut();
                navigate("/login");
              }}
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </div>
        )}
        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              signOut();
              navigate("/login");
            }}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

export function HospitalLayout({ children }: { children: React.ReactNode }) {
  const { user } = useHospitalAuth();

  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full bg-muted/40">
        <HospitalSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/70 bg-background/85 px-3 backdrop-blur-xl md:px-6">
            <SidebarTrigger />
            <div className="flex min-w-0 items-center gap-2">
              <span className="hidden text-sm font-medium sm:inline">City General Hospital · Pune</span>
              <Badge variant="secondary" className="gap-1 text-[11px]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
                Live
              </Badge>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {user && (
                <Badge variant="outline" className="hidden text-[11px] sm:inline-flex">
                  {ROLE_LABEL[user.role]} view
                </Badge>
              )}
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-xs text-primary">
                  {(user?.name ?? "U").split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="mx-auto w-full max-w-7xl flex-1 px-3 py-5 md:px-6 md:py-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
