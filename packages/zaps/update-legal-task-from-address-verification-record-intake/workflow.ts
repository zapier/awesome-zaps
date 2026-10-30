import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Zapier Tables table that receives address verification intake rows. The trigger watches it, and processed rows are deleted from it.
const INTAKE_TABLE_ID = "YOUR_INTAKE_TABLE_ID";
// ClickUp workspace (team) ID that holds the legal tasks.
const CLICKUP_TEAM_ID = "YOUR_CLICKUP_WORKSPACE_ID";
// Delete the intake row after the task update succeeds. Off by default: the update below writes no fields yet, so deleting would drop the verification data. Turn on once the ClickUp field mapping is filled in.
const DELETE_PROCESSED_RECORDS = false;

const InputSchema = z
  .object({
    record_id: z.string(),
    new: z
      .object({
        data: z
          .object({
            f1: z.string().nullable().optional(),
            f2: z.string().nullable().optional(),
            f3: z.string().nullable().optional(),
          })
          .loose()
          .nullable()
          .optional(),
      })
      .loose()
      .nullable()
      .optional(),
  })
  .loose();

function normalizeInput(rawInput: unknown): unknown {
  if (typeof rawInput === "string") {
    return JSON.parse(rawInput);
  }
  return rawInput;
}

const workflow = defineDurable<unknown, unknown>(
  "update-legal-task-from-address-verification-record-intake",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(normalizeInput(rawInput));
    const fields = input.new?.data ?? {};
    // f1 is the task reference, f2 the verification result. f3 (address summary) is not mapped yet.
    const taskReference = fields.f1?.trim() ?? "";
    const verificationResult = fields.f2?.trim() ?? "";

    if (!taskReference) {
      return {
        skipped: true,
        reason: "no-task-reference",
        recordId: input.record_id,
      };
    }
    if (!verificationResult) {
      return {
        skipped: true,
        reason: "no-verification-result",
        recordId: input.record_id,
      };
    }

    const found = await ctx.step("find-clickup-task", async () =>
      sdk.runAction({
        appKey: "clickup",
        actionType: "search",
        actionKey: "findTaskById",
        connection: "clickup",
        inputs: { task_id: taskReference },
      }),
    );

    const task = found.data?.[0] as { id?: string } | undefined;
    if (!task?.id) {
      return {
        skipped: true,
        reason: "task-not-found",
        recordId: input.record_id,
      };
    }

    const update = await ctx.step("update-clickup-task", async () =>
      sdk.runAction({
        appKey: "clickup",
        actionType: "write",
        actionKey: "updateTask",
        connection: "clickup",
        inputs: { team_id: CLICKUP_TEAM_ID, task_id: task.id },
      }),
    );

    if (!DELETE_PROCESSED_RECORDS) {
      return {
        updated: true,
        deleted: false,
        recordId: input.record_id,
        taskId: task.id,
        updatedTask: update.data?.[0] ?? null,
      };
    }

    await ctx.step("delete-intake-record", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "write",
        actionKey: "delete_record",
        connection: "zapier-tables",
        inputs: { table_id: INTAKE_TABLE_ID, record_id: input.record_id },
      }),
    );

    return {
      updated: true,
      deleted: true,
      recordId: input.record_id,
      taskId: task.id,
    };
  },
);

export default workflow;
