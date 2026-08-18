import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getDoctorQueue, listDoctors } from "../../hospital/api";
import { predictWaitingTime } from "../../hospital/ai";

export default defineTool({
  name: "predict_waiting_time",
  title: "Predict waiting time",
  description: "Predict the remaining waiting time for a patient in a doctor's OPD queue using the AI waiting-time model.",
  inputSchema: {
    doctorId: z.string().min(1).describe("Doctor ID whose queue the patient is in."),
    appointmentId: z.string().min(1).describe("Appointment ID of the patient."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ doctorId, appointmentId }) => {
    const [queue, doctors] = await Promise.all([getDoctorQueue(doctorId), listDoctors()]);
    const doctor = doctors.find((d) => d.id === doctorId);
    const prediction = predictWaitingTime(queue, appointmentId, doctor);
    return {
      content: [{ type: "text", text: JSON.stringify(prediction, null, 2) }],
      structuredContent: { prediction },
    };
  },
});
