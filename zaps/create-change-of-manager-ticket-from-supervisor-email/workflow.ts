import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  HR_REQUESTER_EMAIL,
  HR_DEPARTMENT_ID,
  TICKET_TYPE,
  TICKET_PRIORITY,
} from "@/config";
import ai from "@/connections/ai";
import freshservice from "@/connections/freshservice";

const sdk = createZapierSdk();

// Freshservice status code; 2 is Open.
const TICKET_STATUS = 2;
// Freshservice source code; 1 is Email.
const TICKET_SOURCE = 1;

const InputSchema = z
  .object({
    id: z.string(),
    subject: z.string().nullable().optional(),
    body__content: z.string().nullable().optional(),
    bodyPreview: z.string().nullable().optional(),
    from__emailAddress__name: z.string().nullable().optional(),
    from__emailAddress__address: z.string().nullable().optional(),
  })
  .loose();

const PARSE_PROMPT =
  "Read the supervisor's email about a change of manager. Find the employee whose manager is changing and the new manager. Return each person's first and last name exactly as written. Use only names that appear in the email; never guess or invent one. If a person is not named, leave their fields empty.";

const fullName = (first?: string | null, last?: string | null) =>
  [first, last]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");

const workflow = defineDurable<unknown, unknown>(
  "create-change-of-manager-ticket-from-supervisor-email",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const body = input.body__content ?? input.bodyPreview ?? "";

    const parsed = await ctx.step("parse-manager-change-names", async () =>
      sdk.runAction({
        appKey: "ai",
        actionType: "write",
        actionKey: "get_completion",
        connection: ai,
        inputs: {
          model_id: "premium/auto",
          authentication_id: "0",
          instructions: PARSE_PROMPT,
          inputFields: {
            subject: input.subject ?? "",
            body,
          },
          includeWorkflowData: false,
          outputFields: [
            { name: "employee_first_name", type: "text", isRequired: false },
            { name: "employee_last_name", type: "text", isRequired: false },
            { name: "manager_first_name", type: "text", isRequired: false },
            { name: "manager_last_name", type: "text", isRequired: false },
          ],
          isOutputArray: false,
        },
      }),
    );

    const names = parsed.data?.[0] as
      | {
          employee_first_name?: string | null;
          employee_last_name?: string | null;
          manager_first_name?: string | null;
          manager_last_name?: string | null;
        }
      | undefined;
    const employee = fullName(
      names?.employee_first_name,
      names?.employee_last_name,
    );
    const manager = fullName(
      names?.manager_first_name,
      names?.manager_last_name,
    );
    if (!employee && !manager) {
      return { skipped: true, reason: "no-names-found", emailId: input.id };
    }

    const subject = `Change of manager: ${employee || "employee not named"} to ${manager || "new manager not named"}`;
    const sender =
      input.from__emailAddress__name ??
      input.from__emailAddress__address ??
      "a supervisor";
    const description = [
      `Employee: ${employee || "not found in the email"}`,
      `New manager: ${manager || "not found in the email"}`,
      `Requested by: ${sender}`,
      `Email subject: ${input.subject ?? "(no subject)"}`,
      "",
      body,
    ].join("\n");

    const ticket = await ctx.step("create-freshservice-hr-ticket", async () =>
      sdk.runAction({
        appKey: "freshservice",
        actionType: "write",
        actionKey: "create_ticket_action",
        connection: freshservice,
        inputs: {
          ticket__subject: subject,
          ticket__description: description,
          ticket__status: TICKET_STATUS,
          ticket__type: TICKET_TYPE,
          ticket__email: HR_REQUESTER_EMAIL,
          ticket__priority: TICKET_PRIORITY,
          ticket__department_id: HR_DEPARTMENT_ID,
          ticket__source: TICKET_SOURCE,
        },
      }),
    );

    return {
      emailId: input.id,
      employee,
      manager,
      ticket: ticket.data?.[0] ?? null,
    };
  },
);

export default workflow;
