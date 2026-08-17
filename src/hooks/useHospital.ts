import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/hospital/api";
import type { Appointment } from "@/lib/hospital/types";

export const hospitalKeys = {
  departments: ["hospital", "departments"] as const,
  doctors: (f?: unknown) => ["hospital", "doctors", f ?? null] as const,
  patients: ["hospital", "patients"] as const,
  appointments: (f?: unknown) => ["hospital", "appointments", f ?? null] as const,
  queue: (doctorId: string) => ["hospital", "queue", doctorId] as const,
  emergencies: ["hospital", "emergencies"] as const,
  stats: ["hospital", "stats"] as const,
  slots: (doctorId: string, date: string) => ["hospital", "slots", doctorId, date] as const,
};

export const useDepartments = () =>
  useQuery({ queryKey: hospitalKeys.departments, queryFn: api.listDepartments });

export const useDoctors = (filters?: Parameters<typeof api.listDoctors>[0]) =>
  useQuery({ queryKey: hospitalKeys.doctors(filters), queryFn: () => api.listDoctors(filters) });

export const usePatients = () =>
  useQuery({ queryKey: hospitalKeys.patients, queryFn: api.listPatients });

export const useAppointments = (filters?: Parameters<typeof api.listAppointments>[0]) =>
  useQuery({ queryKey: hospitalKeys.appointments(filters), queryFn: () => api.listAppointments(filters) });

export const useDoctorQueue = (doctorId?: string) =>
  useQuery({
    queryKey: hospitalKeys.queue(doctorId ?? "none"),
    queryFn: () => api.getDoctorQueue(doctorId!),
    enabled: !!doctorId,
    refetchInterval: 15000,
  });

export const useEmergencies = () =>
  useQuery({ queryKey: hospitalKeys.emergencies, queryFn: api.listEmergencies });

export const useHospitalStats = () =>
  useQuery({ queryKey: hospitalKeys.stats, queryFn: api.getHospitalStats, refetchInterval: 30000 });

export const useAvailableSlots = (doctorId?: string, date?: string) =>
  useQuery({
    queryKey: hospitalKeys.slots(doctorId ?? "none", date ?? "none"),
    queryFn: () => api.getAvailableSlots(doctorId!, date!),
    enabled: !!doctorId && !!date,
  });

function useInvalidateAll() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["hospital"] });
}

export function useBookAppointment() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: api.bookAppointment,
    onSuccess: invalidate,
  });
}

export function useCallNextPatient() {
  const invalidate = useInvalidateAll();
  return useMutation({ mutationFn: api.callNextPatient, onSuccess: invalidate });
}

export function useUpdateAppointmentStatus() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (v: { id: string; status: Appointment["status"] }) =>
      api.updateAppointmentStatus(v.id, v.status),
    onSuccess: invalidate,
  });
}

export function useToggleDoctorAvailability() {
  const invalidate = useInvalidateAll();
  return useMutation({ mutationFn: api.toggleDoctorAvailability, onSuccess: invalidate });
}

export function useSaveDoctor() {
  const invalidate = useInvalidateAll();
  return useMutation({ mutationFn: api.saveDoctor, onSuccess: invalidate });
}

export function useSaveDepartment() {
  const invalidate = useInvalidateAll();
  return useMutation({ mutationFn: api.saveDepartment, onSuccess: invalidate });
}

export function useUpdateEmergencyStatus() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (v: { id: string; status: "incoming" | "in-treatment" | "stabilised" }) =>
      api.updateEmergencyStatus(v.id, v.status),
    onSuccess: invalidate,
  });
}
