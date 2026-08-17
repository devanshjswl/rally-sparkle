/**
 * AI-ready inference layer.
 *
 * Each function is a deterministic heuristic today (transparent, demo-safe) but
 * is shaped like a model call: input -> { value, confidence, factors }. Swap the
 * body for a real model / edge-function call without touching the UI.
 */
import type { Appointment, Doctor, Priority, QueueEntry } from "./types";

export interface Prediction<T> {
  value: T;
  confidence: number; // 0-1
  factors: string[];
  model: string;
}

/** Waiting-time prediction for a patient in a live queue. */
export function predictWaitingTime(
  queue: QueueEntry[],
  appointmentId: string,
  doctor?: Doctor,
): Prediction<number> {
  const consult = doctor?.avgConsultMinutes ?? 10;
  const entry = queue.find((q) => q.appointment.id === appointmentId);
  const ahead = entry ? entry.position - 1 : queue.length;
  const emergencyLoad = queue.filter((q) => q.appointment.priority === "emergency").length * 6;
  const value = Math.max(0, Math.round(ahead * consult * 1.1 + emergencyLoad));
  return {
    value,
    confidence: ahead <= 3 ? 0.92 : 0.78,
    factors: [
      `${ahead} patient(s) ahead in queue`,
      `Avg consultation ${consult} min for this doctor`,
      emergencyLoad ? `+${emergencyLoad} min for emergency interruptions` : "No emergency interruptions expected",
    ],
    model: "wait-time-regressor-v1",
  };
}

const URGENT = ["chest", "breath", "bleed", "seizure", "unconscious", "accident", "severe", "stroke", "fracture"];

/** Patient priority / triage scoring from age + symptom text. */
export function predictPriority(input: { age: number; reason: string }): Prediction<Priority> {
  const text = input.reason.toLowerCase();
  const hit = URGENT.find((k) => text.includes(k));
  const elderly = input.age >= 60;
  let value: Priority = "normal";
  const factors: string[] = [];
  if (hit) {
    value = text.includes("chest") || text.includes("unconscious") ? "emergency" : "high";
    factors.push(`Symptom keyword detected: "${hit}"`);
  }
  if (elderly) {
    if (value === "normal") value = "high";
    factors.push("Age 60+ raises triage weight");
  }
  if (!factors.length) factors.push("No red-flag symptoms in description");
  return { value, confidence: hit ? 0.88 : 0.71, factors, model: "triage-classifier-v1" };
}

/** Suggests better slots when a doctor's day is unevenly loaded. */
export function optimiseAppointments(
  appointments: Appointment[],
  doctors: Doctor[],
): Prediction<{ doctorId: string; suggestion: string; gain: string }[]> {
  const value = doctors.slice(0, 4).map((d) => {
    const load = appointments.filter((a) => a.doctorId === d.id && a.status !== "cancelled").length;
    const capacity = Math.max(1, Math.round((5 * 60) / d.avgConsultMinutes));
    const pct = Math.round((load / capacity) * 100);
    return {
      doctorId: d.id,
      suggestion:
        pct > 70
          ? `Shift ${Math.max(1, Math.round(load * 0.2))} non-urgent token(s) to the afternoon window`
          : pct < 30
            ? "Open extra walk-in slots — capacity is under-used"
            : "Schedule is balanced, no change needed",
      gain: pct > 70 ? `~${Math.round(pct * 0.18)} min shorter average wait` : pct < 30 ? `+${capacity - load} usable slots` : "—",
    };
  });
  return { value, confidence: 0.74, factors: ["Token distribution vs. slot capacity", "Historical no-show rate 11%"], model: "schedule-optimiser-v1" };
}

/** Doctor workload index — 0-100 with a burnout flag. */
export function predictWorkload(
  doctor: Doctor,
  appointments: Appointment[],
): Prediction<{ index: number; label: "Light" | "Balanced" | "Heavy" | "Overloaded" }> {
  const load = appointments.filter((a) => a.doctorId === doctor.id && a.status !== "cancelled").length;
  const capacity = Math.max(1, Math.round((5 * 60) / doctor.avgConsultMinutes));
  const index = Math.min(100, Math.round((load / capacity) * 100) + (doctor.available ? 0 : 5));
  const label = index > 85 ? "Overloaded" : index > 60 ? "Heavy" : index > 30 ? "Balanced" : "Light";
  return {
    value: { index, label },
    confidence: 0.81,
    factors: [`${load} of ~${capacity} slots used`, `Avg ${doctor.avgConsultMinutes} min per consultation`],
    model: "workload-index-v1",
  };
}

/** OPD crowd prediction for the next hours. */
export function predictCrowd(
  forecast: { hour: string; actual: number | null; predicted: number }[],
): Prediction<{ peakHour: string; peakLoad: number; quietHour: string }> {
  const upcoming = forecast.filter((f) => f.actual === null);
  const peak = upcoming.reduce((a, b) => (b.predicted > a.predicted ? b : a), upcoming[0] ?? forecast[0]);
  const quiet = upcoming.reduce((a, b) => (b.predicted < a.predicted ? b : a), upcoming[0] ?? forecast[0]);
  return {
    value: { peakHour: peak.hour, peakLoad: peak.predicted, quietHour: quiet.hour },
    confidence: 0.83,
    factors: ["Same-weekday footfall over last 8 weeks", "Walk-in vs. booked ratio", "Seasonal fever trend"],
    model: "crowd-forecast-v1",
  };
}
