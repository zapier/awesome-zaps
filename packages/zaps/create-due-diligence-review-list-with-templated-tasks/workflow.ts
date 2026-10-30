import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// ClickUp workspace (team) ID. Found in the ClickUp URL after app.clickup.com/.
const TEAM_ID = "YOUR_TEAM_ID";
// ClickUp space the review lists are created in.
const SPACE_ID = "YOUR_SPACE_ID";
// ClickUp list template that holds the due-diligence task set.
const TEMPLATE_ID = "YOUR_TEMPLATE_ID";
// Payload field -> ClickUp custom field ID that receives its value on each task.
const CUSTOM_FIELD_IDS: Record<string, string> = {
  counterparty: "YOUR_COUNTERPARTY_FIELD_ID",
  contact_name: "YOUR_CONTACT_NAME_FIELD_ID",
  contact_email: "YOUR_CONTACT_EMAIL_FIELD_ID",
  address: "YOUR_ADDRESS_FIELD_ID",
  invoice_number: "YOUR_INVOICE_NUMBER_FIELD_ID",
};
// Tasks whose name contains this text get the document due date; all others get the review due date.
const DOCUMENT_TASK_MATCH = "document";
// Set to false to skip assigning the requestor to each task.
const ASSIGN_REQUESTOR = true;

const InputSchema = z
  .object({
    client_name: z.string(),
    counterparty: z.string().nullable().optional(),
    review_due_date: z.string().nullable().optional(),
    document_due_date: z.string().nullable().optional(),
    contact_name: z.string().nullable().optional(),
    contact_email: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    invoice_number: z.string().nullable().optional(),
    month: z.union([z.string(), z.number()]).nullable().optional(),
    year: z.union([z.string(), z.number()]).nullable().optional(),
    requestor_email: z.string().nullable().optional(),
  })
  .loose();

function normalizeInput(rawInput: unknown): unknown {
  if (typeof rawInput === "string") {
    return JSON.parse(rawInput);
  }
  return rawInput;
}

// ClickUp takes due dates as epoch milliseconds.
function toEpochMs(isoDate: string | null | undefined): number | null {
  if (!isoDate) {
    return null;
  }
  const ms = Date.parse(isoDate);
  return Number.isNaN(ms) ? null : ms;
}

const workflow = defineDurable<unknown, unknown>(
  "create-due-diligence-review-list-with-templated-tasks",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(normalizeInput(rawInput));

    const now = await ctx.step("capture-now", async () =>
      new Date().toISOString(),
    );
    const nowDate = new Date(now);
    const year = String(input.year ?? nowDate.getUTCFullYear());
    const month = String(input.month ?? nowDate.getUTCMonth() + 1).padStart(
      2,
      "0",
    );
    const listName = `[${year}-${month}] ${input.client_name}`;

    // UNVERIFIED: the raw-request response shape (data[0].id) is confirmed on the first run.
    const created = await ctx.step(
      "create-review-list-from-template",
      async () =>
        sdk.runAction({
          appKey: "clickup",
          actionType: "write",
          actionKey: "_zap_raw_request",
          connection: "clickup",
          inputs: {
            fail_on_errors: true,
            method: "POST",
            url: `https://api.clickup.com/api/v2/space/${SPACE_ID}/list/template/${TEMPLATE_ID}`,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: listName }),
          },
        }),
    );

    const listId = String(created.data[0]?.id ?? "");
    if (!listId) {
      throw new Error(
        "ClickUp did not return a list ID for the new review list",
      );
    }

    const requestorId =
      ASSIGN_REQUESTOR && input.requestor_email
        ? await ctx.step("find-requestor-user", async () => {
            const found = await sdk.runAction({
              appKey: "clickup",
              actionType: "search",
              actionKey: "findUser",
              connection: "clickup",
              inputs: {
                team_id: TEAM_ID,
                field: "email",
                value: input.requestor_email,
                include_shared: true,
              },
            });
            return found.data[0]?.id ?? null;
          })
        : null;

    // UNVERIFIED: the task list shape (data[0].tasks) is confirmed on the first run.
    const tasksPage = await ctx.step("find-review-tasks", async () =>
      sdk.runAction({
        appKey: "clickup",
        actionType: "write",
        actionKey: "_zap_raw_request",
        connection: "clickup",
        inputs: {
          fail_on_errors: true,
          method: "GET",
          url: `https://api.clickup.com/api/v2/list/${listId}/task`,
        },
      }),
    );
    const tasks: Array<{ id: string; name: string }> =
      tasksPage.data[0]?.tasks ?? [];

    const reviewDue = toEpochMs(input.review_due_date);
    const documentDue = toEpochMs(input.document_due_date);
    const customFieldEntries = Object.entries(CUSTOM_FIELD_IDS).filter(
      ([key]) => input[key as keyof typeof input],
    );

    const results: Array<{ task: string; ok: boolean; error?: string }> = [];
    for (const task of tasks) {
      const isDocument = task.name.toLowerCase().includes(DOCUMENT_TASK_MATCH);
      const dueDate = isDocument ? documentDue : reviewDue;

      const updated = await ctx.step(`update-task-${task.id}`, async () => {
        try {
          await sdk.runAction({
            appKey: "clickup",
            actionType: "write",
            actionKey: "_zap_raw_request",
            connection: "clickup",
            inputs: {
              fail_on_errors: true,
              method: "PUT",
              url: `https://api.clickup.com/api/v2/task/${task.id}`,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                due_date: dueDate,
                assignees: requestorId ? { add: [requestorId] } : undefined,
              }),
            },
          });
          return { task: task.id, ok: true };
        } catch (error) {
          return { task: task.id, ok: false, error: String(error) };
        }
      });
      results.push(updated);

      for (const [key, fieldId] of customFieldEntries) {
        const value = String(input[key as keyof typeof input]);
        const set = await ctx.step(`set-field-${key}-${task.id}`, async () => {
          try {
            await sdk.runAction({
              appKey: "clickup",
              actionType: "write",
              actionKey: "_zap_raw_request",
              connection: "clickup",
              inputs: {
                fail_on_errors: true,
                method: "POST",
                url: `https://api.clickup.com/api/v2/task/${task.id}/field/${fieldId}`,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ value }),
              },
            });
            return { task: task.id, ok: true };
          } catch (error) {
            return { task: task.id, ok: false, error: String(error) };
          }
        });
        results.push(set);
      }
    }

    const failures = results.filter((r) => !r.ok);
    return {
      listId,
      listName,
      tasksFound: tasks.length,
      updates: results.length,
      failures: failures.length,
    };
  },
);

export default workflow;
