import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Asana workspace, project and section are set in the trigger config (Task Moved to Section).
// Use the same values there as your A/B testing section: the workspace ID, the project ID and the section ID.
// Notion data source (the experiment database) that new entries are created in.
const EXPERIMENT_DATA_SOURCE = "YOUR_NOTION_DATA_SOURCE_ID";
// Notion format of the entry body; markdown renders headings and links.
const CONTENT_FORMAT = "markdown";

const TaskSchema = z
  .object({
    gid: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    permalink_url: z.string().nullable().optional(),
    assignee: z
      .object({ name: z.string().nullable().optional() })
      .loose()
      .nullable()
      .optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "create-a-b-test-entry-in-your-experiment-database",
  async (ctx, rawInput) => {
    const task = TaskSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const content = [
      `# ${task.name ?? "Untitled task"}`,
      "",
      `Task: ${task.permalink_url ?? ""}`,
      `Owner: ${task.assignee?.name ?? "Unassigned"}`,
      "",
      task.notes ?? "",
    ].join("\n");

    const entry = await ctx.step("create-experiment-entry", async () =>
      sdk.runAction({
        appKey: "notion",
        actionType: "write",
        actionKey: "create_database_item",
        connection: "notion",
        inputs: {
          datasource: EXPERIMENT_DATA_SOURCE,
          template_mode: "none",
          content,
          content_format: CONTENT_FORMAT,
        },
      }),
    );

    return { taskGid: task.gid ?? null, created: entry.data?.[0] ?? null };
  },
);

export default workflow;
