import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { HospitalUser, Role } from "@/lib/hospital/types";

/**
 * Session boundary for the hospital app.
 *
 * Session is persisted locally so the demo works with no backend. To go live,
 * replace signIn / signUp / signOut with real auth calls and keep the same
 * `user` shape — every screen only reads from this context.
 */

const STORAGE_KEY = "smarthospital.session";

const DEMO_USERS: Record<Role, HospitalUser> = {
  patient: { id: "usr-p", name: "Devansh Jaiswal", email: "patient@hospital.in", role: "patient", patientId: "pat-1" },
  doctor: { id: "usr-d", name: "Dr. Ananya Rao", email: "doctor@hospital.in", role: "doctor", doctorId: "doc-1" },
  admin: { id: "usr-a", name: "Nurse Station / Admin", email: "admin@hospital.in", role: "admin" },
};

interface Ctx {
  user: HospitalUser | null;
  loading: boolean;
  signIn: (role: Role, email?: string, name?: string) => Promise<HospitalUser>;
  signUp: (input: { name: string; email: string; role: Role }) => Promise<HospitalUser>;
  signOut: () => void;
}

const HospitalAuthContext = createContext<Ctx | undefined>(undefined);

export function HospitalAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<HospitalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* ignore corrupt session */
    }
    setLoading(false);
  }, []);

  const persist = (u: HospitalUser | null) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo<Ctx>(
    () => ({
      user,
      loading,
      signIn: async (role, email, name) => {
        const base = DEMO_USERS[role];
        const next: HospitalUser = { ...base, email: email || base.email, name: name || base.name };
        persist(next);
        return next;
      },
      signUp: async ({ name, email, role }) => {
        const base = DEMO_USERS[role];
        const next: HospitalUser = { ...base, id: `usr-${Date.now()}`, name, email };
        persist(next);
        return next;
      },
      signOut: () => persist(null),
    }),
    [user, loading],
  );

  return <HospitalAuthContext.Provider value={value}>{children}</HospitalAuthContext.Provider>;
}

export function useHospitalAuth() {
  const ctx = useContext(HospitalAuthContext);
  if (!ctx) throw new Error("useHospitalAuth must be used within HospitalAuthProvider");
  return ctx;
}

export const homeForRole = (role: Role) =>
  role === "patient" ? "/app/patient" : role === "doctor" ? "/app/doctor" : "/app/admin";
