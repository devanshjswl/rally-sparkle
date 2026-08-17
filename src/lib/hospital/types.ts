export type Role = "patient" | "doctor" | "admin";

export interface HospitalUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** doctor id when role === "doctor" */
  doctorId?: string;
  /** patient id when role === "patient" */
  patientId?: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  icon: string;
  openFrom: string;
  openTo: string;
  rooms: number;
  /** live OPD load, 0-100 */
  load: number;
}

export interface Doctor {
  id: string;
  name: string;
  departmentId: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  rating: number;
  fee: number;
  room: string;
  available: boolean;
  /** e.g. ["Mon", "Tue"] */
  days: string[];
  slotStart: string;
  slotEnd: string;
  avgConsultMinutes: number;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  phone: string;
  bloodGroup: string;
  uhid: string;
}

export type AppointmentStatus =
  | "waiting"
  | "in-consultation"
  | "completed"
  | "cancelled";

export type Priority = "emergency" | "high" | "normal";

export interface Appointment {
  id: string;
  tokenNumber: number;
  patientId: string;
  patientName: string;
  doctorId: string;
  departmentId: string;
  date: string; // YYYY-MM-DD
  slot: string; // HH:mm
  reason: string;
  status: AppointmentStatus;
  priority: Priority;
  /** minutes, AI-predicted */
  predictedWait: number;
  createdAt: string;
}

export interface EmergencyCase {
  id: string;
  patientName: string;
  age: number;
  condition: string;
  triage: "Red" | "Yellow" | "Green";
  arrivedAt: string;
  departmentId: string;
  assignedDoctorId?: string;
  status: "incoming" | "in-treatment" | "stabilised";
}

export interface QueueEntry {
  appointment: Appointment;
  position: number;
  etaMinutes: number;
}
