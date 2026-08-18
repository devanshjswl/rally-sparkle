import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HeartPulse, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { homeForRole, useHospitalAuth } from "@/contexts/HospitalAuthContext";
import { ease } from "@/components/hospital/primitives";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const { signIn } = useHospitalAuth();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await signIn(email, password);
      toast.success(`Signed in as ${user.name}`);
      navigate(homeForRole(user.role), { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
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
            <CardDescription>Your role and dashboard are loaded from your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
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
              New here?{" "}
              <Link to="/register" className="text-primary underline-offset-4 hover:underline">
                Create an account
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
