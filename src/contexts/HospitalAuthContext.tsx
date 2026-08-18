import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { HospitalUser, Role } from "@/lib/hospital/types";

/**
 * Session boundary for the hospital app, backed by real Supabase auth.
 * `hospital_profiles` (created by a DB trigger on sign-up) carries the role
 * plus an optional link to a doctor_id / patient_id row.
 */

interface SignUpInput {
  name: string;
  email: string;
  password: string;
  role: Role;
}

interface Ctx {
  user: HospitalUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<HospitalUser>;
  signUp: (input: SignUpInput) => Promise<HospitalUser>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const HospitalAuthContext = createContext<Ctx | undefined>(undefined);

async function loadProfile(authUserId: string): Promise<HospitalUser | null> {
  const { data, error } = await supabase
    .from("hospital_profiles")
    .select("*")
    .eq("id", authUserId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    doctorId: data.doctor_id ?? undefined,
    patientId: data.patient_id ?? undefined,
  };
}

export function HospitalAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<HospitalUser | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrate = async () => {
    const { data } = await supabase.auth.getSession();
    const authUser = data.session?.user;
    if (!authUser) {
      setUser(null);
      return;
    }
    // The DB trigger creates the profile row asynchronously right after
    // sign-up; retry briefly in case we beat it.
    let profile = await loadProfile(authUser.id);
    for (let i = 0; i < 5 && !profile; i++) {
      await new Promise((r) => setTimeout(r, 300));
      profile = await loadProfile(authUser.id);
    }
    setUser(profile);
  };

  useEffect(() => {
    hydrate().finally(() => setLoading(false));
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      hydrate();
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      user,
      loading,
      signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const profile = await loadProfile(data.user.id);
        if (!profile) throw new Error("Signed in, but no hospital profile was found for this account.");
        setUser(profile);
        return profile;
      },
      signUp: async ({ name, email, password, role }) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name, role } },
        });
        if (error) throw error;
        if (!data.user) throw new Error("Sign up did not return a user.");

        let profile = await loadProfile(data.user.id);
        for (let i = 0; i < 8 && !profile; i++) {
          await new Promise((r) => setTimeout(r, 300));
          profile = await loadProfile(data.user.id);
        }
        if (!profile) throw new Error("Account created, but the hospital profile hasn't appeared yet — try signing in.");
        setUser(profile);
        return profile;
      },
      signOut: async () => {
        await supabase.auth.signOut();
        setUser(null);
      },
      refreshUser: hydrate,
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
