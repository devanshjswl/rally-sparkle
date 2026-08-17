import type {
  Appointment,
  Department,
  Doctor,
  EmergencyCase,
  Patient,
} from "./types";

export const today = new Date().toISOString().slice(0, 10);

export const departments: Department[] = [
  { id: "dep-gm", name: "General Medicine", description: "Fever, infections, chronic care and routine OPD consultations.", icon: "Stethoscope", openFrom: "08:00", openTo: "20:00", rooms: 6, load: 82 },
  { id: "dep-card", name: "Cardiology", description: "Heart care, ECG, echo and hypertension follow-ups.", icon: "HeartPulse", openFrom: "09:00", openTo: "17:00", rooms: 3, load: 64 },
  { id: "dep-ortho", name: "Orthopaedics", description: "Fractures, joint pain, sports injuries and physiotherapy.", icon: "Bone", openFrom: "09:00", openTo: "18:00", rooms: 4, load: 71 },
  { id: "dep-peds", name: "Paediatrics", description: "Child health, immunisation and growth monitoring.", icon: "Baby", openFrom: "08:00", openTo: "16:00", rooms: 4, load: 48 },
  { id: "dep-neuro", name: "Neurology", description: "Headache, epilepsy, stroke follow-up and nerve disorders.", icon: "Brain", openFrom: "10:00", openTo: "16:00", rooms: 2, load: 55 },
  { id: "dep-derm", name: "Dermatology", description: "Skin, hair and allergy consultations.", icon: "Sparkles", openFrom: "10:00", openTo: "15:00", rooms: 2, load: 33 },
  { id: "dep-ent", name: "ENT", description: "Ear, nose, throat, audiometry and sinus care.", icon: "Ear", openFrom: "09:00", openTo: "17:00", rooms: 2, load: 42 },
  { id: "dep-emer", name: "Emergency & Trauma", description: "24x7 casualty, triage and critical stabilisation.", icon: "Siren", openFrom: "00:00", openTo: "23:59", rooms: 8, load: 90 },
];

export const doctors: Doctor[] = [
  { id: "doc-1", name: "Dr. Ananya Rao", departmentId: "dep-gm", specialization: "Internal Medicine", qualification: "MBBS, MD", experienceYears: 12, rating: 4.8, fee: 400, room: "OPD-104", available: true, days: ["Mon", "Tue", "Wed", "Fri"], slotStart: "09:00", slotEnd: "14:00", avgConsultMinutes: 8 },
  { id: "doc-2", name: "Dr. Vikram Sethi", departmentId: "dep-card", specialization: "Interventional Cardiology", qualification: "MBBS, MD, DM", experienceYears: 18, rating: 4.9, fee: 900, room: "OPD-201", available: true, days: ["Mon", "Thu", "Sat"], slotStart: "10:00", slotEnd: "15:00", avgConsultMinutes: 12 },
  { id: "doc-3", name: "Dr. Meera Iyer", departmentId: "dep-peds", specialization: "Neonatology", qualification: "MBBS, DCH", experienceYears: 9, rating: 4.7, fee: 500, room: "OPD-112", available: true, days: ["Tue", "Wed", "Thu", "Sat"], slotStart: "08:30", slotEnd: "13:30", avgConsultMinutes: 10 },
  { id: "doc-4", name: "Dr. Rohit Nair", departmentId: "dep-ortho", specialization: "Joint Replacement", qualification: "MBBS, MS Ortho", experienceYears: 14, rating: 4.6, fee: 700, room: "OPD-305", available: true, days: ["Mon", "Wed", "Fri"], slotStart: "11:00", slotEnd: "16:00", avgConsultMinutes: 11 },
  { id: "doc-5", name: "Dr. Sana Qureshi", departmentId: "dep-neuro", specialization: "Epilepsy & Stroke", qualification: "MBBS, MD, DM", experienceYears: 11, rating: 4.8, fee: 850, room: "OPD-208", available: false, days: ["Thu", "Fri"], slotStart: "10:00", slotEnd: "14:00", avgConsultMinutes: 15 },
  { id: "doc-6", name: "Dr. Arjun Patel", departmentId: "dep-derm", specialization: "Clinical Dermatology", qualification: "MBBS, MD", experienceYears: 7, rating: 4.5, fee: 450, room: "OPD-118", available: true, days: ["Mon", "Tue", "Sat"], slotStart: "10:30", slotEnd: "14:30", avgConsultMinutes: 7 },
  { id: "doc-7", name: "Dr. Kavya Menon", departmentId: "dep-ent", specialization: "Otolaryngology", qualification: "MBBS, MS", experienceYears: 10, rating: 4.6, fee: 550, room: "OPD-130", available: true, days: ["Wed", "Thu", "Fri"], slotStart: "09:30", slotEnd: "13:30", avgConsultMinutes: 9 },
  { id: "doc-8", name: "Dr. Imran Shaikh", departmentId: "dep-emer", specialization: "Emergency Medicine", qualification: "MBBS, MEM", experienceYears: 13, rating: 4.7, fee: 0, room: "Casualty", available: true, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], slotStart: "00:00", slotEnd: "23:59", avgConsultMinutes: 6 },
  { id: "doc-9", name: "Dr. Neha Bansal", departmentId: "dep-gm", specialization: "Diabetes & Thyroid", qualification: "MBBS, MD", experienceYears: 8, rating: 4.5, fee: 400, room: "OPD-106", available: true, days: ["Tue", "Thu", "Sat"], slotStart: "12:00", slotEnd: "17:00", avgConsultMinutes: 9 },
];

export const patients: Patient[] = [
  { id: "pat-1", name: "Devansh Jaiswal", age: 21, gender: "Male", phone: "+91 98220 41xxx", bloodGroup: "B+", uhid: "UHID-2026-00841" },
  { id: "pat-2", name: "Rekha Sharma", age: 54, gender: "Female", phone: "+91 90045 22xxx", bloodGroup: "O+", uhid: "UHID-2026-00842" },
  { id: "pat-3", name: "Aman Verma", age: 34, gender: "Male", phone: "+91 99880 13xxx", bloodGroup: "A+", uhid: "UHID-2026-00843" },
  { id: "pat-4", name: "Fatima Sheikh", age: 29, gender: "Female", phone: "+91 88991 76xxx", bloodGroup: "AB+", uhid: "UHID-2026-00844" },
  { id: "pat-5", name: "Harish Gowda", age: 67, gender: "Male", phone: "+91 78450 90xxx", bloodGroup: "B-", uhid: "UHID-2026-00845" },
];

const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
const lastWeek = new Date(Date.now() - 6 * 864e5).toISOString().slice(0, 10);

export const appointments: Appointment[] = [
  { id: "apt-1", tokenNumber: 12, patientId: "pat-1", patientName: "Devansh Jaiswal", doctorId: "doc-1", departmentId: "dep-gm", date: today, slot: "10:30", reason: "Persistent fever and fatigue", status: "waiting", priority: "normal", predictedWait: 24, createdAt: `${today}T08:12:00` },
  { id: "apt-2", tokenNumber: 9, patientId: "pat-2", patientName: "Rekha Sharma", doctorId: "doc-1", departmentId: "dep-gm", date: today, slot: "10:00", reason: "BP review", status: "in-consultation", priority: "high", predictedWait: 0, createdAt: `${today}T07:40:00` },
  { id: "apt-3", tokenNumber: 10, patientId: "pat-3", patientName: "Aman Verma", doctorId: "doc-1", departmentId: "dep-gm", date: today, slot: "10:10", reason: "Follow-up on blood report", status: "waiting", priority: "normal", predictedWait: 9, createdAt: `${today}T07:55:00` },
  { id: "apt-4", tokenNumber: 11, patientId: "pat-4", patientName: "Fatima Sheikh", doctorId: "doc-1", departmentId: "dep-gm", date: today, slot: "10:20", reason: "Severe abdominal pain", status: "waiting", priority: "high", predictedWait: 15, createdAt: `${today}T08:02:00` },
  { id: "apt-5", tokenNumber: 4, patientId: "pat-5", patientName: "Harish Gowda", doctorId: "doc-2", departmentId: "dep-card", date: today, slot: "11:00", reason: "Chest discomfort on exertion", status: "waiting", priority: "high", predictedWait: 18, createdAt: `${today}T09:20:00` },
  { id: "apt-6", tokenNumber: 5, patientId: "pat-3", patientName: "Aman Verma", doctorId: "doc-2", departmentId: "dep-card", date: today, slot: "11:15", reason: "Echo report review", status: "waiting", priority: "normal", predictedWait: 32, createdAt: `${today}T09:31:00` },
  { id: "apt-7", tokenNumber: 7, patientId: "pat-1", patientName: "Devansh Jaiswal", doctorId: "doc-6", departmentId: "dep-derm", date: yesterday, slot: "11:30", reason: "Skin allergy", status: "completed", priority: "normal", predictedWait: 0, createdAt: `${yesterday}T10:02:00` },
  { id: "apt-8", tokenNumber: 3, patientId: "pat-1", patientName: "Devansh Jaiswal", doctorId: "doc-4", departmentId: "dep-ortho", date: lastWeek, slot: "12:00", reason: "Knee pain after running", status: "completed", priority: "normal", predictedWait: 0, createdAt: `${lastWeek}T11:15:00` },
  { id: "apt-9", tokenNumber: 6, patientId: "pat-2", patientName: "Rekha Sharma", doctorId: "doc-3", departmentId: "dep-peds", date: lastWeek, slot: "09:30", reason: "Child vaccination", status: "cancelled", priority: "normal", predictedWait: 0, createdAt: `${lastWeek}T08:40:00` },
];

export const emergencyCases: EmergencyCase[] = [
  { id: "emr-1", patientName: "Unidentified male, ~40y", age: 40, condition: "Road traffic accident, head injury", triage: "Red", arrivedAt: "09:42", departmentId: "dep-emer", assignedDoctorId: "doc-8", status: "in-treatment" },
  { id: "emr-2", patientName: "Sunita Deshmukh", age: 61, condition: "Suspected myocardial infarction", triage: "Red", arrivedAt: "10:05", departmentId: "dep-card", assignedDoctorId: "doc-2", status: "in-treatment" },
  { id: "emr-3", patientName: "Rajat Khanna", age: 27, condition: "Deep laceration, left forearm", triage: "Yellow", arrivedAt: "10:18", departmentId: "dep-emer", status: "incoming" },
  { id: "emr-4", patientName: "Baby Aarohi", age: 3, condition: "High fever with seizure episode", triage: "Yellow", arrivedAt: "10:26", departmentId: "dep-peds", assignedDoctorId: "doc-3", status: "stabilised" },
];

/** Hourly OPD footfall — actual so far, AI-predicted for the rest of the day. */
export const opdCrowdForecast = [
  { hour: "08:00", actual: 34, predicted: 32 },
  { hour: "09:00", actual: 61, predicted: 58 },
  { hour: "10:00", actual: 88, predicted: 84 },
  { hour: "11:00", actual: 79, predicted: 81 },
  { hour: "12:00", actual: null, predicted: 66 },
  { hour: "13:00", actual: null, predicted: 41 },
  { hour: "14:00", actual: null, predicted: 52 },
  { hour: "15:00", actual: null, predicted: 63 },
  { hour: "16:00", actual: null, predicted: 47 },
  { hour: "17:00", actual: null, predicted: 29 },
];

export const weeklyFootfall = [
  { day: "Mon", opd: 412, emergency: 28 },
  { day: "Tue", opd: 388, emergency: 21 },
  { day: "Wed", opd: 431, emergency: 33 },
  { day: "Thu", opd: 402, emergency: 25 },
  { day: "Fri", opd: 455, emergency: 30 },
  { day: "Sat", opd: 372, emergency: 19 },
  { day: "Sun", opd: 188, emergency: 24 },
];
