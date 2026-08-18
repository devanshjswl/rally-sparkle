import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HeartPulse, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { registerPatient, listDoctors } from "@/lib/hospital/api";
import { supabase } from "@/integrations/supabase/client";
import { homeForRole, useHospitalAuth } from "@/contexts/HospitalAuthContext";
import type { Doctor, Role } from "@/lib/hospital/types";
import { ease } from "@/components/hospital/primitives";

export default function Register() {
  const [role, setRole] = useState<Role>("patient");
  const [account, setAccount] = useState({ name: "", email: "", password: "" });
  const [patientForm, setPatientForm] = useState({ age: "", gender: "Male", phone: "", bloodGroup: "B+" });
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [linkDoctorId, setLinkDoctorId] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const { signUp } = useHospitalAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role === "doctor") listDoctors().then(setDoctors).catch(() => setDoctors([]));
  }, [role]);

  const setA = (k: keyof typeof account) => (v: string) => setAccount((f) => ({ ...f, [k]: v }));
  const setP = (k: keyof typeof patientForm) => (v: string) => setPatientForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await signUp({ name: account.name, email: account.email, password: account.password, role });

      if (role === "patient") {
        const patient = await registerPatient(
          {
            name: account.name,
            age: Number(patientForm.age) || 0,
            gender: patientForm.gender as "Male" | "Female" | "Other",
            phone: patientForm.phone,
            bloodGroup: patientForm.bloodGroup,
          },
          user.id,
        );
        await supabase.from("hospital_profiles").update({ patient_id: patient.id }).eq("id", user.id);
        toast.success(`Registered · ${patient.uhid}`);
      } else if (role === "doctor" && linkDoctorId) {
        await supabase.from("hospital_profiles").update({ doctor_id: linkDoctorId }).eq("id", user.id);
      }

      if (role !== "patient") toast.success(`Account created — welcome, ${account.name}`);
      navigate(homeForRole(role), { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
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
        className="w-full max-w-lg"
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
            <CardTitle className="font-display text-2xl">Create an account</CardTitle>
            <CardDescription>
              {role === "patient"
                ? "A hospital UHID is generated instantly — use it for every future visit and token."
                : role === "doctor"
                  ? "Link your account to your doctor listing to see your live queue."
                  : "Admin accounts can manage doctors, departments and emergencies."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={role} onValueChange={(v) => setRole(v as Role)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="patient">Patient</TabsTrigger>
                <TabsTrigger value="doctor">Doctor</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={submit} className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={account.name} onChange={(e) => setA("name")(e.target.value)} required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={account.email} onChange={(e) => setA("email")(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    minLength={6}
                    value={account.password}
                    onChange={(e) => setA("password")(e.target.value)}
                    required
                  />
                </div>
              </div>

              {role === "patient" && (
                <>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="age">Age</Label>
                      <Input id="age" type="number" min="0" max="120" value={patientForm.age} onChange={(e) => setP("age")(e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Gender</Label>
                      <Select value={patientForm.gender} onValueChange={setP("gender")}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["Male", "Female", "Other"].map((g) => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Blood group</Label>
                      <Select value={patientForm.bloodGroup} onValueChange={setP("bloodGroup")}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((b) => (
                            <SelectItem key={b} value={b}>{b}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Mobile number</Label>
                    <Input id="phone" value={patientForm.phone} onChange={(e) => setP("phone")(e.target.value)} placeholder="+91 " required />
                  </div>
                </>
              )}

              {role === "doctor" && (
                <div className="space-y-1.5">
                  <Label>Link to doctor listing (optional)</Label>
                  <Select value={linkDoctorId} onValueChange={setLinkDoctorId}>
                    <SelectTrigger><SelectValue placeholder="Choose your listing if it already exists" /></SelectTrigger>
                    <SelectContent>
                      {doctors.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.name} — {d.specialization}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Not listed yet? An admin can add you under Manage Doctors, then you can link it later.
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={busy}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create account
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already registered?{" "}
              <Link to="/login" className="text-primary underline-offset-4 hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
