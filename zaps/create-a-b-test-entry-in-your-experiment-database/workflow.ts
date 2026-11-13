import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import { EXPERIMENT_DATA_SOURCE, CONTENT_FORMAT } from "./config.ts";

const sdk = createZapierSdk();

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

const workflow = defineDurable(
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
