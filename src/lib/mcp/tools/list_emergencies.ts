import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { listEmergencies } from "../../hospital/api";

export default defineTool({
  name: "list_emergencies",
  title: "List emergency cases",
  description: "Return the current emergency triage board with red, yellow, and green cases and their status.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const emergencies = await listEmergencies();
    return {
      content: [{ type: "text", text: JSON.stringify(emergencies, null, 2) }],
      structuredContent: { emergencies },
    };
  },
});
