import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Google Tasks list to watch for new tasks. Use the same ID as the trigger's Task List.
const SOURCE_TASK_LIST_ID = "YOUR_SOURCE_TASK_LIST_ID";
// Google Tasks list (your primary inbox) that receives the copies.
const PRIMARY_TASK_LIST_ID = "YOUR_PRIMARY_TASK_LIST_ID";

const InputSchema = z
  .object({
    id: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    due: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "copy-new-tasks-into-your-primary-task-list",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const title = (input.title ?? "").trim();
    const due = input.due ?? null;

    if (!title) {
      return { skipped: true, reason: "no-title" };
    }
    if (input.status === "completed") {
      return { skipped: true, reason: "task-completed", title };
    }

    const existing = await ctx.step("find-matching-primary-task", async () =>
      sdk.runAction({
        appKey: "google-tasks",
        actionType: "search",
        actionKey: "find_task",
        connection: "google-tasks",
        inputs: {
          list: PRIMARY_TASK_LIST_ID,
          title,
        },
      }),
    );

    const matches = (existing.data ?? []) as Array<{
      title?: string | null;
      due?: string | null;
    }>;
    const alreadyMirrored = matches.some(
      (task) => task.title === title && (task.due ?? null) === due,
    );
    if (alreadyMirrored) {
      return { skipped: true, reason: "already-mirrored", title };
    }

    const created = await ctx.step("create-primary-task", async () =>
      sdk.runAction({
        appKey: "google-tasks",
        actionType: "write",
        actionKey: "task",
        connection: "google-tasks",
        inputs: {
          task_list: PRIMARY_TASK_LIST_ID,
          title,
          notes: input.notes ?? "",
          due: due ?? undefined,
        },
      }),
    );

    return { title, due, created: created.data?.[0] ?? null };
  },
);

export default workflow;
