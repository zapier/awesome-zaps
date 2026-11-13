import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  CREATE_TASK_URL,
  SCORE_TASK_URL,
  HABIT_TRACKER_TOKEN,
} from "./config.ts";

const sdk = createZapierSdk();

const InputSchema = z
  .object({
    id: z.union([z.string(), z.number()]).nullable().optional(),
    content: z.string().nullable().optional(),
    note: z.string().nullable().optional(),
    completed_at: z.string().nullable().optional(),
  })
  .loose();

const headers = { Authorization: `Bearer ${HABIT_TRACKER_TOKEN}` };

const workflow = defineDurable(
  "create-habit-task-when-you-complete-a-todo",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const title = input.content ?? "";
    if (!title) {
      return { skipped: true, reason: "no-task-title" };
    }

    const created = await ctx.step("create-habit-task", async () =>
      sdk.runAction({
        appKey: "webhook",
        actionType: "write",
        actionKey: "post",
        inputs: {
          url: CREATE_TASK_URL,
          payload_type: "json",
          headers,
          data: {
            title,
            description: input.note ?? "",
            completed_at: input.completed_at ?? null,
            source_task_id: input.id ?? null,
          },
          unflatten: "no",
          extract_variables: "no",
        },
      }),
    );

    const taskId = (created.data[0] as { id?: string | number } | undefined)
      ?.id;
    if (!taskId) {
      return {
        skipped: true,
        reason: "habit-task-create-returned-no-id",
        title,
      };
    }

    await ctx.step("score-habit-task", async () =>
      sdk.runAction({
        appKey: "webhook",
        actionType: "write",
        actionKey: "post",
        inputs: {
          url: `${SCORE_TASK_URL}/${taskId}`,
          payload_type: "json",
          headers,
          data: { scored: true },
          unflatten: "no",
          extract_variables: "no",
        },
      }),
    );

    return { taskId, title, scored: true };
  },
);

export default workflow;
