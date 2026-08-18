/**
 * Single data-access boundary for the hospital app.
 *
 * Every screen goes through these functions (via src/hooks/useHospital.ts).
 * They talk to the real `hospital_*` tables in Supabase — no in-memory mock
 * data. Row Level Security enforces who can read/write what; see
 * supabase/migrations/20260817120000_hospital_schema.sql.
 */
import { supabase } from "@/integrations/supabase/client";
import type {
  Appointment,
  Department,
  Doctor,
  EmergencyCase,
  Patient,
  Priority,
  QueueEntry,
} from "./types";

export const today = new Date().toISOString().slice(0, 10);

/* ------------------------------- mappers ---------------------------------- */

const toDepartment = (r: any): Department => ({
  id: r.id,
  name: r.name,
  description: r.description ?? "",
  icon: r.icon ?? "Stethoscope",
  openFrom: r.open_from,
  openTo: r.open_to,
  rooms: r.rooms,
  load: r.load,
});

const toDoctor = (r: any): Doctor => ({
  id: r.id,
  name: r.name,
  departmentId: r.department_id,
  specialization: r.specialization ?? "",
  qualification: r.qualification ?? "",
  experienceYears: r.experience_years,
  rating: Number(r.rating),
  fee: r.fee,
  room: r.room ?? "",
  available: r.available,
  days: r.days ?? [],
  slotStart: r.slot_start,
  slotEnd: r.slot_end,
  avgConsultMinutes: r.avg_consult_minutes,
});

const toPatient = (r: any): Patient => ({
  id: r.id,
  name: r.name,
  age: r.age ?? 0,
  gender: (r.gender ?? "Other") as Patient["gender"],
  phone: r.phone ?? "",
  bloodGroup: r.blood_group ?? "",
  uhid: r.uhid,
});

const toAppointment = (r: any): Appointment => ({
  id: r.id,
  tokenNumber: r.token_number,
  patientId: r.patient_id,
  patientName: r.patient_name,
  doctorId: r.doctor_id,
  departmentId: r.department_id,
  date: r.date,
  slot: r.slot,
  reason: r.reason ?? "",
  status: r.status,
  priority: r.priority,
  predictedWait: r.predicted_wait,
  createdAt: r.created_at,
});

const toEmergency = (r: any): EmergencyCase => ({
  id: r.id,
  patientName: r.patient_name,
  age: r.age ?? 0,
  condition: r.condition ?? "",
  triage: r.triage,
  arrivedAt: r.arrived_at,
  departmentId: r.department_id,
  assignedDoctorId: r.assigned_doctor_id ?? undefined,
  status: r.status,
});

/* ---------------------------------- reads ---------------------------------- */

export async function listDepartments(): Promise<Department[]> {
  const { data, error } = await supabase.from("hospital_departments").select("*").order("name");
  if (error) throw error;
  return (data ?? []).map(toDepartment);
}

export async function listDoctors(filters?: {
  query?: string;
  departmentId?: string;
  availableOnly?: boolean;
}): Promise<Doctor[]> {
  let q = supabase.from("hospital_doctors").select("*").order("name");
  if (filters?.departmentId) q = q.eq("department_id", filters.departmentId);
  if (filters?.availableOnly) q = q.eq("available", true);
  const { data, error } = await q;
  if (error) throw error;
  let doctors = (data ?? []).map(toDoctor);
  const query = filters?.query?.trim().toLowerCase();
  if (query) {
    doctors = doctors.filter((d) => `${d.name} ${d.specialization}`.toLowerCase().includes(query));
  }
  return doctors;
}

export async function listPatients(): Promise<Patient[]> {
  const { data, error } = await supabase.from("hospital_patients").select("*").order("name");
  if (error) throw error;
  return (data ?? []).map(toPatient);
}

export async function listAppointments(filters?: {
  patientId?: string;
  doctorId?: string;
  date?: string;
}): Promise<Appointment[]> {
  let q = supabase.from("hospital_appointments").select("*").order("token_number");
  if (filters?.patientId) q = q.eq("patient_id", filters.patientId);
  if (filters?.doctorId) q = q.eq("doctor_id", filters.doctorId);
  if (filters?.date) q = q.eq("date", filters.date);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(toAppointment);
}

export async function listEmergencies(): Promise<EmergencyCase[]> {
  const { data, error } = await supabase
    .from("hospital_emergencies")
    .select("*")
    .order("arrived_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toEmergency);
}

/** Live queue for one doctor, ordered by priority then token. */
export async function getDoctorQueue(doctorId: string): Promise<QueueEntry[]> {
  const [{ data: doctorRow }, { data: aptRows, error }] = await Promise.all([
    supabase.from("hospital_doctors").select("avg_consult_minutes").eq("id", doctorId).maybeSingle(),
    supabase
      .from("hospital_appointments")
      .select("*")
      .eq("doctor_id", doctorId)
      .eq("date", today)
      .not("status", "in", '("cancelled","completed")')
      .order("token_number"),
  ]);
  if (error) throw error;

  const consult = doctorRow?.avg_consult_minutes ?? 10;
  const rank: Record<Priority, number> = { emergency: 0, high: 1, normal: 2 };
  const queue = (aptRows ?? [])
    .map(toAppointment)
    .sort((a, b) => rank[a.priority] - rank[b.priority] || a.tokenNumber - b.tokenNumber);

  return queue.map((appointment, i) => ({
    appointment,
    position: i + 1,
    etaMinutes: appointment.status === "in-consultation" ? 0 : i * consult,
  }));
}

export async function getAvailableSlots(doctorId: string, date: string): Promise<string[]> {
  const { data: doctorRow, error: doctorErr } = await supabase
    .from("hospital_doctors")
    .select("slot_start, slot_end")
    .eq("id", doctorId)
    .maybeSingle();
  if (doctorErr) throw doctorErr;
  if (!doctorRow) return [];

  const { data: aptRows, error } = await supabase
    .from("hospital_appointments")
    .select("slot")
    .eq("doctor_id", doctorId)
    .eq("date", date)
    .neq("status", "cancelled");
  if (error) throw error;

  const taken = new Set((aptRows ?? []).map((a) => a.slot));
  const slots: string[] = [];
  const [sh, sm] = doctorRow.slot_start.split(":").map(Number);
  const [eh, em] = doctorRow.slot_end.split(":").map(Number);
  for (let m = sh * 60 + sm; m < eh * 60 + em; m += 20) {
    const s = `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    if (!taken.has(s)) slots.push(s);
  }
  return slots.slice(0, 18);
}

/* --------------------------------- writes ---------------------------------- */

export async function bookAppointment(input: {
  patientId: string;
  patientName: string;
  doctorId: string;
  date: string;
  slot: string;
  reason: string;
  priority?: Priority;
}): Promise<Appointment> {
  const { data: doctorRow, error: doctorErr } = await supabase
    .from("hospital_doctors")
    .select("id, department_id, avg_consult_minutes")
    .eq("id", input.doctorId)
    .maybeSingle();
  if (doctorErr) throw doctorErr;
  if (!doctorRow) throw new Error("Doctor not found");

  const { data: sameDay, error: sameDayErr } = await supabase
    .from("hospital_appointments")
    .select("token_number, status")
    .eq("doctor_id", input.doctorId)
    .eq("date", input.date);
  if (sameDayErr) throw sameDayErr;

  const tokenNumber = sameDay?.length ? Math.max(...sameDay.map((a) => a.token_number)) + 1 : 1;
  const waitingAhead = (sameDay ?? []).filter((a) => a.status === "waiting").length;

  const { data, error } = await supabase
    .from("hospital_appointments")
    .insert({
      token_number: tokenNumber,
      patient_id: input.patientId,
      patient_name: input.patientName,
      doctor_id: doctorRow.id,
      department_id: doctorRow.department_id,
      date: input.date,
      slot: input.slot,
      reason: input.reason,
      status: "waiting",
      priority: input.priority ?? "normal",
      predicted_wait: Math.max(5, waitingAhead * doctorRow.avg_consult_minutes),
    })
    .select("*")
    .single();
  if (error) throw error;
  return toAppointment(data);
}

export async function updateAppointmentStatus(id: string, status: Appointment["status"]): Promise<void> {
  const { error } = await supabase.from("hospital_appointments").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function callNextPatient(doctorId: string): Promise<Appointment | null> {
  const { data: current } = await supabase
    .from("hospital_appointments")
    .select("id")
    .eq("doctor_id", doctorId)
    .eq("date", today)
    .eq("status", "in-consultation")
    .maybeSingle();
  if (current) {
    await supabase.from("hospital_appointments").update({ status: "completed" }).eq("id", current.id);
  }

  const queue = await getDoctorQueue(doctorId);
  const next = queue.find((q) => q.appointment.status === "waiting");
  if (!next) return null;

  const { data, error } = await supabase
    .from("hospital_appointments")
    .update({ status: "in-consultation", predicted_wait: 0 })
    .eq("id", next.appointment.id)
    .select("*")
    .single();
  if (error) throw error;
  return toAppointment(data);
}

export async function toggleDoctorAvailability(doctorId: string): Promise<void> {
  const { data: doc, error: readErr } = await supabase
    .from("hospital_doctors")
    .select("available")
    .eq("id", doctorId)
    .maybeSingle();
  if (readErr) throw readErr;
  if (!doc) return;
  const { error } = await supabase
    .from("hospital_doctors")
    .update({ available: !doc.available })
    .eq("id", doctorId);
  if (error) throw error;
}

export async function saveDoctor(input: Omit<Doctor, "id"> & { id?: string }): Promise<Doctor> {
  const row = {
    name: input.name,
    department_id: input.departmentId,
    specialization: input.specialization,
    qualification: input.qualification,
    experience_years: input.experienceYears,
    rating: input.rating,
    fee: input.fee,
    room: input.room,
    available: input.available,
    days: input.days,
    slot_start: input.slotStart,
    slot_end: input.slotEnd,
    avg_consult_minutes: input.avgConsultMinutes,
  };
  if (input.id) {
    const { data, error } = await supabase
      .from("hospital_doctors")
      .update(row)
      .eq("id", input.id)
      .select("*")
      .single();
    if (error) throw error;
    return toDoctor(data);
  }
  const { data, error } = await supabase.from("hospital_doctors").insert(row).select("*").single();
  if (error) throw error;
  return toDoctor(data);
}

export async function saveDepartment(input: Omit<Department, "id"> & { id?: string }): Promise<Department> {
  const row = {
    name: input.name,
    description: input.description,
    icon: input.icon,
    open_from: input.openFrom,
    open_to: input.openTo,
    rooms: input.rooms,
    load: input.load,
  };
  if (input.id) {
    const { data, error } = await supabase
      .from("hospital_departments")
      .update(row)
      .eq("id", input.id)
      .select("*")
      .single();
    if (error) throw error;
    return toDepartment(data);
  }
  const { data, error } = await supabase.from("hospital_departments").insert(row).select("*").single();
  if (error) throw error;
  return toDepartment(data);
}

export async function updateEmergencyStatus(id: string, status: EmergencyCase["status"]): Promise<void> {
  const { error } = await supabase.from("hospital_emergencies").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function registerPatient(input: Omit<Patient, "id" | "uhid">, profileId?: string): Promise<Patient> {
  const uhid = `UHID-${new Date().getFullYear()}-${String(Math.floor(10000 + Math.random() * 89999))}`;
  const { data, error } = await supabase
    .from("hospital_patients")
    .insert({
      profile_id: profileId ?? null,
      name: input.name,
      age: input.age,
      gender: input.gender,
      phone: input.phone,
      blood_group: input.bloodGroup,
      uhid,
    })
    .select("*")
    .single();
  if (error) throw error;
  return toPatient(data);
}

/* ------------------------------- analytics --------------------------------- */

export async function getHospitalStats() {
  const [{ data: todays, error: aptErr }, { data: emergencies, error: emErr }, { data: doctors, error: docErr }, { data: departments, error: depErr }] =
    await Promise.all([
      supabase.from("hospital_appointments").select("status, predicted_wait").eq("date", today),
      supabase.from("hospital_emergencies").select("status"),
      supabase.from("hospital_doctors").select("available"),
      supabase.from("hospital_departments").select("id"),
    ]);
  if (aptErr) throw aptErr;
  if (emErr) throw emErr;
  if (docErr) throw docErr;
  if (depErr) throw depErr;

  const rows = todays ?? [];
  const waiting = rows.filter((a) => a.status === "waiting");
  return {
    appointmentsToday: rows.length,
    waiting: waiting.length,
    inConsultation: rows.filter((a) => a.status === "in-consultation").length,
    completed: rows.filter((a) => a.status === "completed").length,
    activeEmergencies: (emergencies ?? []).filter((e) => e.status !== "stabilised").length,
    doctorsOnDuty: (doctors ?? []).filter((d) => d.available).length,
    totalDoctors: (doctors ?? []).length,
    departments: (departments ?? []).length,
    avgWait: Math.round(
      waiting.reduce((s, a) => s + (a.predicted_wait ?? 0), 0) / Math.max(1, waiting.length),
    ),
  };
}

/** Hourly OPD load for today, actual counts for past hours + a simple forecast for future ones. */
export async function getOpdCrowdForecast(): Promise<{ hour: string; actual: number | null; predicted: number }[]> {
  const { data, error } = await supabase
    .from("hospital_appointments")
    .select("slot, status")
    .eq("date", today);
  if (error) throw error;

  const byHour = new Map<number, number>();
  for (const a of data ?? []) {
    const hour = Number(a.slot.split(":")[0]);
    byHour.set(hour, (byHour.get(hour) ?? 0) + 1);
  }
  const nowHour = new Date().getHours();
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  const values = hours.map((h) => byHour.get(h) ?? 0);
  const avg = values.reduce((s, v) => s + v, 0) / Math.max(1, values.filter((v) => v > 0).length || 1);

  return hours.map((h) => ({
    hour: `${String(h).padStart(2, "0")}:00`,
    actual: h <= nowHour ? byHour.get(h) ?? 0 : null,
    predicted: byHour.get(h) ?? Math.round(avg),
  }));
}

/** Booked + emergency counts per weekday, for the current week so far. */
export async function getWeeklyFootfall(): Promise<{ day: string; opd: number; emergency: number }[]> {
  const start = new Date();
  start.setDate(start.getDate() - start.getDay());
  const startStr = start.toISOString().slice(0, 10);

  const [{ data: appts, error: aptErr }, { data: emg, error: emErr }] = await Promise.all([
    supabase.from("hospital_appointments").select("date").gte("date", startStr),
    supabase.from("hospital_emergencies").select("arrived_at").gte("arrived_at", startStr),
  ]);
  if (aptErr) throw aptErr;
  if (emErr) throw emErr;

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const opdByDay = new Array(7).fill(0);
  const emgByDay = new Array(7).fill(0);
  for (const a of appts ?? []) opdByDay[new Date(a.date).getDay()]++;
  for (const e of emg ?? []) emgByDay[new Date(e.arrived_at).getDay()]++;

  return days.map((day, i) => ({ day, opd: opdByDay[i], emergency: emgByDay[i] }));
}
