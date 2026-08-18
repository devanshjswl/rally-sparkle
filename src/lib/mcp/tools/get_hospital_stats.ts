import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getHospitalStats } from "../../hospital/api";

export default defineTool({
  name: "get_hospital_stats",
  title: "Get hospital stats",
  description: "Return a high-level snapshot of today's hospital operations: appointments, queue length, emergency load, and bed occupancy.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const stats = await getHospitalStats();
    return {
      content: [{ type: "text", text: JSON.stringify(stats, null, 2) }],
      structuredContent: { stats },
    };
  },
});
