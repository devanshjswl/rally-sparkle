import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { HospitalAuthProvider } from "@/contexts/HospitalAuthContext";
import { RequireRole, RoleHome } from "@/components/hospital/RequireRole";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import AIInsights from "./pages/AIInsights";
import EmergencyBoard from "./pages/shared/EmergencyBoard";

import PatientOverview from "./pages/patient/PatientOverview";
import PatientToken from "./pages/patient/PatientToken";
import BookAppointment from "./pages/patient/BookAppointment";
import FindDoctors from "./pages/patient/FindDoctors";
import VisitHistory from "./pages/patient/VisitHistory";

import DoctorOverview from "./pages/doctor/DoctorOverview";
import DoctorQueue from "./pages/doctor/DoctorQueue";
import DoctorSchedule from "./pages/doctor/DoctorSchedule";

import AdminOverview from "./pages/admin/AdminOverview";
import LiveQueues from "./pages/admin/LiveQueues";
import AllAppointments from "./pages/admin/AllAppointments";
import ManageDoctors from "./pages/admin/ManageDoctors";
import ManageDepartments from "./pages/admin/ManageDepartments";
import PatientsList from "./pages/admin/PatientsList";
import Analytics from "./pages/admin/Analytics";

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const patient = (el: React.ReactNode) => <RequireRole role="patient">{el}</RequireRole>;
const doctor = (el: React.ReactNode) => <RequireRole role="doctor">{el}</RequireRole>;
const admin = (el: React.ReactNode) => <RequireRole role="admin">{el}</RequireRole>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="hospital-theme">
      <HospitalAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/app" element={<RoleHome />} />

              {/* Patient */}
              <Route path="/app/patient" element={patient(<PatientOverview />)} />
              <Route path="/app/patient/token" element={patient(<PatientToken />)} />
              <Route path="/app/patient/book" element={patient(<BookAppointment />)} />
              <Route path="/app/patient/doctors" element={patient(<FindDoctors />)} />
              <Route path="/app/patient/history" element={patient(<VisitHistory />)} />
              <Route path="/app/patient/ai" element={patient(<AIInsights />)} />

              {/* Doctor */}
              <Route path="/app/doctor" element={doctor(<DoctorOverview />)} />
              <Route path="/app/doctor/queue" element={doctor(<DoctorQueue />)} />
              <Route path="/app/doctor/schedule" element={doctor(<DoctorSchedule />)} />
              <Route path="/app/doctor/emergency" element={doctor(<EmergencyBoard />)} />
              <Route path="/app/doctor/ai" element={doctor(<AIInsights />)} />

              {/* Admin / nurse station */}
              <Route path="/app/admin" element={admin(<AdminOverview />)} />
              <Route path="/app/admin/queues" element={admin(<LiveQueues />)} />
              <Route path="/app/admin/appointments" element={admin(<AllAppointments />)} />
              <Route path="/app/admin/emergency" element={admin(<EmergencyBoard />)} />
              <Route path="/app/admin/doctors" element={admin(<ManageDoctors />)} />
              <Route path="/app/admin/departments" element={admin(<ManageDepartments />)} />
              <Route path="/app/admin/patients" element={admin(<PatientsList />)} />
              <Route path="/app/admin/analytics" element={admin(<Analytics />)} />
              <Route path="/app/admin/ai" element={admin(<AIInsights />)} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </HospitalAuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
