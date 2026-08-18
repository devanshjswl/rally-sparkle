import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { bookAppointment } from "../../hospital/api";
import type { Priority } from "../../hospital/types";

export default defineTool({
  name: "book_appointment",
  title: "Book appointment",
  description: "Book a new OPD appointment for a patient with a specific doctor, date, and time slot.",
  inputSchema: {
    patientId: z.string().min(1).describe("Registered patient ID."),
    patientName: z.string().min(1).describe("Patient display name."),
    doctorId: z.string().min(1).describe("Doctor ID to book with."),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Appointment date in YYYY-MM-DD format."),
    slot: z.string().regex(/^\d{2}:\d{2}$/).describe("Appointment time slot in HH:mm format."),
    reason: z.string().min(1).describe("Reason for the visit / symptoms."),
    priority: z.enum(["normal", "high", "emergency"]).optional().describe("Optional triage priority."),
  },
  annotations: { readOnlyHint: false, idempotentHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ patientId, patientName, doctorId, date, slot, reason, priority }) => {
    try {
      const appointment = await bookAppointment({
        patientId,
        patientName,
        doctorId,
        date,
        slot,
        reason,
        priority: (priority as Priority) ?? "normal",
      });
      return {
        content: [{ type: "text", text: JSON.stringify(appointment, null, 2) }],
        structuredContent: { appointment },
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      throw new ToolError(message);
    }
  },
});
