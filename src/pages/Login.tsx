import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { HeartPulse, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { homeForRole, useHospitalAuth } from "@/contexts/HospitalAuthContext";
import type { Role } from "@/lib/hospital/types";
import { ease } from "@/components/hospital/primitives";

const DEMO: Record<Role, { email: string; hint: string }> = {
  patient: { email: "patient@hospital.in", hint: "Books appointments, holds a digital token, tracks the queue." },
  doctor: { email: "doctor@hospital.in", hint: "Runs the OPD queue and sees workload insights." },
  admin: { email: "admin@hospital.in", hint: "Manages doctors, departments, emergencies and analytics." },
};

export default function Login() {
  const [params] = useSearchParams();
  const initial = (params.get("role") as Role) || "patient";
  const [role, setRole] = useState<Role>(["patient", "doctor", "admin"].includes(initial) ? initial : "patient");
  const [email, setEmail] = useState(DEMO[initial as Role]?.email ?? DEMO.patient.email);
  const [password, setPassword] = useState("demo1234");
  const [busy, setBusy] = useState(false);
  const { signIn } = useHospitalAuth();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await signIn(role, email);
      toast.success(`Signed in as ${user.name}`);
      navigate(homeForRole(role), { replace: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-svh place-items-center bg-muted/40 px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="w-full max-w-md"
      >
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <HeartPulse className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold">
            Aarogya<span className="text-primary">AI</span>
          </span>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl">Sign in</CardTitle>
            <CardDescription>Choose the workflow you want to open.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={role}
              onValueChange={(v) => {
                setRole(v as Role);
                setEmail(DEMO[v as Role].email);
              }}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="patient">Patient</TabsTrigger>
                <TabsTrigger value="doctor">Doctor</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="mt-3 text-xs text-muted-foreground">{DEMO[role].hint}</p>

            <form onSubmit={submit} className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign in
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              New patient?{" "}
              <Link to="/register" className="text-primary underline-offset-4 hover:underline">
                Register here
              </Link>
            </p>
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Demo environment — any password works, no real records are stored.
        </p>
      </motion.div>
    </div>
  );
}
