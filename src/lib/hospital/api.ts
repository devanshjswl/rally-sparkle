/**
 * Single data-access boundary for the hospital app.
 *
 * Everything the UI needs goes through these functions. Today they resolve
 * against in-memory mock data; to move to a real backend, replace each function
 * body with a fetch / Lovable Cloud query — the signatures and return shapes
 * are the contract the UI depends on.
 */
import * as mock from "./mock";
import type {
  Appointment,
  Department,
  Doctor,
  EmergencyCase,
  Patient,
  Priority,
  QueueEntry,
} from "./types";

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const delay = (ms = 180) => new Promise((r) => setTimeout(r, ms));

/** Mutable in-memory tables (stand-in for database tables). */
const db = {
  departments: clone(mock.departments),
  doctors: clone(mock.doctors),
  patients: clone(mock.patients),
  appointments: clone(mock.appointments),
  emergencies: clone(mock.emergencyCases),
};

export const today = mock.today;

/* ---------------------------------- reads --------------------------------- */

export async function listDepartments(): Promise<Department[]> {
  await delay();
  return clone(db.departments);
}

export async function listDoctors(filters?: {
  query?: string;
  departmentId?: string;
  availableOnly?: boolean;
}): Promise<Doctor[]> {
  await delay();
  const q = filters?.query?.trim().toLowerCase();
  return clone(
    db.doctors.filter((d) => {
      if (filters?.departmentId && d.departmentId !== filters.departmentId) return false;
      if (filters?.availableOnly && !d.available) return false;
      if (!q) return true;
      const dep = db.departments.find((x) => x.id === d.departmentId)?.name ?? "";
      return `${d.name} ${d.specialization} ${dep}`.toLowerCase().includes(q);
    }),
  );
}

export async function listPatients(): Promise<Patient[]> {
  await delay();
  return clone(db.patients);
}

export async function listAppointments(filters?: {
  patientId?: string;
  doctorId?: string;
  date?: string;
}): Promise<Appointment[]> {
  await delay();
  return clone(
    db.appointments.filter((a) => {
      if (filters?.patientId && a.patientId !== filters.patientId) return false;
      if (filters?.doctorId && a.doctorId !== filters.doctorId) return false;
      if (filters?.date && a.date !== filters.date) return false;
      return true;
    }),
  );
}

export async function listEmergencies(): Promise<EmergencyCase[]> {
  await delay();
  return clone(db.emergencies);
}

/** Live queue for one doctor, ordered by priority then token. */
export async function getDoctorQueue(doctorId: string): Promise<QueueEntry[]> {
  await delay();
  const doctor = db.doctors.find((d) => d.id === doctorId);
  const consult = doctor?.avgConsultMinutes ?? 10;
  const rank: Record<Priority, number> = { emergency: 0, high: 1, normal: 2 };
  const queue = db.appointments
    .filter((a) => a.doctorId === doctorId && a.date === today && a.status !== "cancelled" && a.status !== "completed")
    .sort((a, b) => rank[a.priority] - rank[b.priority] || a.tokenNumber - b.tokenNumber);

  return clone(
    queue.map((appointment, i) => ({
      appointment,
      position: i + 1,
      etaMinutes: appointment.status === "in-consultation" ? 0 : i * consult,
    })),
  );
}

export async function getAvailableSlots(doctorId: string, date: string): Promise<string[]> {
  await delay();
  const doctor = db.doctors.find((d) => d.id === doctorId);
  if (!doctor) return [];
  const taken = db.appointments
    .filter((a) => a.doctorId === doctorId && a.date === date && a.status !== "cancelled")
    .map((a) => a.slot);
  const slots: string[] = [];
  const [sh, sm] = doctor.slotStart.split(":").map(Number);
  const [eh, em] = doctor.slotEnd.split(":").map(Number);
  for (let m = sh * 60 + sm; m < eh * 60 + em; m += 20) {
    const s = `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    if (!taken.includes(s)) slots.push(s);
  }
  return slots.slice(0, 18);
}

/* --------------------------------- writes --------------------------------- */

export async function bookAppointment(input: {
  patientId: string;
  patientName: string;
  doctorId: string;
  date: string;
  slot: string;
  reason: string;
  priority?: Priority;
}): Promise<Appointment> {
  await delay(320);
  const doctor = db.doctors.find((d) => d.id === input.doctorId);
  if (!doctor) throw new Error("Doctor not found");
  const sameDay = db.appointments.filter((a) => a.doctorId === input.doctorId && a.date === input.date);
  const appointment: Appointment = {
    id: `apt-${Date.now()}`,
    tokenNumber: sameDay.length ? Math.max(...sameDay.map((a) => a.tokenNumber)) + 1 : 1,
    patientId: input.patientId,
    patientName: input.patientName,
    doctorId: doctor.id,
    departmentId: doctor.departmentId,
    date: input.date,
    slot: input.slot,
    reason: input.reason,
    status: "waiting",
    priority: input.priority ?? "normal",
    predictedWait: Math.max(5, sameDay.filter((a) => a.status === "waiting").length * doctor.avgConsultMinutes),
    createdAt: new Date().toISOString(),
  };
  db.appointments.push(appointment);
  return clone(appointment);
}

export async function updateAppointmentStatus(
  id: string,
  status: Appointment["status"],
): Promise<void> {
  await delay(140);
  const apt = db.appointments.find((a) => a.id === id);
  if (apt) apt.status = status;
}

export async function callNextPatient(doctorId: string): Promise<Appointment | null> {
  await delay(200);
  const current = db.appointments.find(
    (a) => a.doctorId === doctorId && a.date === today && a.status === "in-consultation",
  );
  if (current) current.status = "completed";
  const queue = await getDoctorQueue(doctorId);
  const next = queue.find((q) => q.appointment.status === "waiting");
  if (!next) return null;
  const target = db.appointments.find((a) => a.id === next.appointment.id);
  if (target) {
    target.status = "in-consultation";
    target.predictedWait = 0;
    return clone(target);
  }
  return null;
}

export async function toggleDoctorAvailability(doctorId: string): Promise<void> {
  await delay(120);
  const doc = db.doctors.find((d) => d.id === doctorId);
  if (doc) doc.available = !doc.available;
}

export async function saveDoctor(input: Omit<Doctor, "id"> & { id?: string }): Promise<Doctor> {
  await delay(240);
  if (input.id) {
    const i = db.doctors.findIndex((d) => d.id === input.id);
    if (i >= 0) db.doctors[i] = { ...db.doctors[i], ...input } as Doctor;
    return clone(db.doctors[i]);
  }
  const created: Doctor = { ...input, id: `doc-${Date.now()}` };
  db.doctors.push(created);
  return clone(created);
}

export async function saveDepartment(input: Omit<Department, "id"> & { id?: string }): Promise<Department> {
  await delay(240);
  if (input.id) {
    const i = db.departments.findIndex((d) => d.id === input.id);
    if (i >= 0) db.departments[i] = { ...db.departments[i], ...input } as Department;
    return clone(db.departments[i]);
  }
  const created: Department = { ...input, id: `dep-${Date.now()}` };
  db.departments.push(created);
  return clone(created);
}

export async function updateEmergencyStatus(
  id: string,
  status: EmergencyCase["status"],
): Promise<void> {
  await delay(140);
  const c = db.emergencies.find((e) => e.id === id);
  if (c) c.status = status;
}

export async function registerPatient(input: Omit<Patient, "id" | "uhid">): Promise<Patient> {
  await delay(300);
  const created: Patient = {
    ...input,
    id: `pat-${Date.now()}`,
    uhid: `UHID-2026-${String(800 + db.patients.length + 1).padStart(5, "0")}`,
  };
  db.patients.push(created);
  return clone(created);
}

/* ------------------------------- analytics -------------------------------- */

export async function getHospitalStats() {
  await delay();
  const todays = db.appointments.filter((a) => a.date === today);
  return {
    appointmentsToday: todays.length,
    waiting: todays.filter((a) => a.status === "waiting").length,
    inConsultation: todays.filter((a) => a.status === "in-consultation").length,
    completed: todays.filter((a) => a.status === "completed").length,
    activeEmergencies: db.emergencies.filter((e) => e.status !== "stabilised").length,
    doctorsOnDuty: db.doctors.filter((d) => d.available).length,
    totalDoctors: db.doctors.length,
    departments: db.departments.length,
    avgWait: Math.round(
      todays.filter((a) => a.status === "waiting").reduce((s, a) => s + a.predictedWait, 0) /
        Math.max(1, todays.filter((a) => a.status === "waiting").length),
    ),
  };
}

export const opdCrowdForecast = mock.opdCrowdForecast;
export const weeklyFootfall = mock.weeklyFootfall;
