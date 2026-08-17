import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { HospitalLayout } from "@/components/hospital/HospitalLayout";
import { homeForRole, useHospitalAuth } from "@/contexts/HospitalAuthContext";
import type { Role } from "@/lib/hospital/types";

/**
 * Route guard. Swap the auth context for real auth later — this component and
 * the routes below stay unchanged.
 */
export function RequireRole({ role, children }: { role: Role; children: React.ReactNode }) {
  const { user, loading } = useHospitalAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (user.role !== role) return <Navigate to={homeForRole(user.role)} replace />;

  return <HospitalLayout>{children}</HospitalLayout>;
}

export function RoleHome() {
  const { user, loading } = useHospitalAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={homeForRole(user.role)} replace />;
}
