import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { listDepartments } from "../../hospital/api";

export default defineTool({
  name: "list_departments",
  title: "List departments",
  description: "List all hospital departments, including their operating hours, rooms, and current OPD load.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const departments = await listDepartments();
    return {
      content: [{ type: "text", text: JSON.stringify(departments, null, 2) }],
      structuredContent: { departments },
    };
  },
});
