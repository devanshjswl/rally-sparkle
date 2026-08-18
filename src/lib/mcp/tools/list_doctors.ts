import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { listDoctors } from "../../hospital/api";

export default defineTool({
  name: "list_doctors",
  title: "List doctors",
  description: "Search and filter doctors by name, specialization, department, and availability.",
  inputSchema: {
    query: z.string().optional().describe("Optional text search across name, specialization, and department."),
    departmentId: z.string().optional().describe("Filter by department ID."),
    availableOnly: z.boolean().optional().describe("Only return currently available doctors."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, departmentId, availableOnly }) => {
    const doctors = await listDoctors({ query, departmentId, availableOnly });
    return {
      content: [{ type: "text", text: JSON.stringify(doctors, null, 2) }],
      structuredContent: { doctors },
    };
  },
});
