import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import { REMOVAL_API_URL } from "./config.ts";

const sdk = createZapierSdk();

function normalizeInput(rawInput: unknown): unknown {
  if (typeof rawInput === "string") {
    return JSON.parse(rawInput);
  }
  return rawInput;
}

const InputSchema = z
  .object({
    gid: z.string(),
    name: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable(
  "trigger-environment-cleanup-when-sprint-task-is-tagged",
  async (ctx, rawInput) => {
    const task = InputSchema.parse(normalizeInput(rawInput));

    const removal = await ctx.step("post-removal-request", async () =>
      sdk.runAction({
        appKey: "webhook",
        actionType: "write",
        actionKey: "post",
        inputs: {
          url: REMOVAL_API_URL,
          payload_type: "json",
          data: {
            task_id: task.gid,
            summary: task.name ?? "",
            action: "remove",
          },
          extract_variables: "no",
        },
      }),
    );

    return { taskId: task.gid, posted: removal.data.length > 0 };
  },
);

export default workflow;
