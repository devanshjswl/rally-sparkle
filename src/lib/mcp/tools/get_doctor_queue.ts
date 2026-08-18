import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getDoctorQueue } from "../../hospital/api";

export default defineTool({
  name: "get_doctor_queue",
  title: "Get doctor queue",
  description: "Return the live OPD queue for a specific doctor, including patient positions and estimated waiting times.",
  inputSchema: {
    doctorId: z.string().min(1).describe("The doctor ID to fetch the queue for."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ doctorId }) => {
    const queue = await getDoctorQueue(doctorId);
    return {
      content: [{ type: "text", text: JSON.stringify(queue, null, 2) }],
      structuredContent: { queue },
    };
  },
});
