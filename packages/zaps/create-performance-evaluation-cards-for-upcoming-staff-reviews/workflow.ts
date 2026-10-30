import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Zapier Tables table ID of the employees table (the long ID in the table's URL). Needs Employee ID, First Name, Last Name, Evaluation Date, Supervisor ID and Trello Member ID columns.
const EMPLOYEES_TABLE_ID = "YOUR_EMPLOYEES_TABLE_ID";
// Trello board ID that review cards are created on.
const TRELLO_BOARD_ID = "YOUR_TRELLO_BOARD_ID";
// Trello list ID of the 'Due Soon' list on that board.
const TRELLO_LIST_ID = "YOUR_DUE_SOON_LIST_ID";
// Evaluation form URL; each card's checklist links to it with the employee ID appended.
const EVALUATION_FORM_URL = "YOUR_EVALUATION_FORM_URL";
// How many days ahead to look for evaluations due.
const LOOKAHEAD_DAYS = 21;
// How many days after creation a card is due.
const CARD_DUE_DAYS = 7;
// Name of the checklist added to each card.
const CHECKLIST_NAME = "To Complete";

const DAY_MS = 24 * 60 * 60 * 1000;

const EmployeeSchema = z
  .object({
    f1: z.string().nullable().optional(), // Employee ID
    f2: z.string().nullable().optional(), // First Name
    f3: z.string().nullable().optional(), // Last Name
    f4: z.string().nullable().optional(), // Evaluation Date
    f5: z.string().nullable().optional(), // Supervisor ID
    f6: z.string().nullable().optional(), // Trello Member ID
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "create-performance-evaluation-cards-for-upcoming-staff-reviews",
  async (ctx) => {
    const records = await ctx.step("read-employee-records", async () => {
      const result = await sdk.runAction({
        appKey: "zapier-tables",
        actionType: "write",
        actionKey: "ae_538493_zapier_tables_get_all_records_from_zapie",
        connection: "zapier-tables",
        inputs: { tableId: EMPLOYEES_TABLE_ID },
      });
      return result.data;
    });

    const employees = (records as unknown[]).map((record) => {
      const row = record as { data?: unknown };
      const fields = EmployeeSchema.parse(row.data ?? record);
      return {
        employeeId: fields.f1 ?? "",
        name: [fields.f2, fields.f3].filter(Boolean).join(" "),
        evaluationDate: fields.f4 ?? null,
        supervisorId: fields.f5 ?? null,
        trelloMemberId: fields.f6 ?? null,
      };
    });

    const runAt = await ctx.step("capture-run-time", async () =>
      new Date().toISOString(),
    );
    const now = Date.parse(runAt);
    const windowEnd = now + LOOKAHEAD_DAYS * DAY_MS;
    const dueSoon = employees.filter((employee) => {
      if (!employee.evaluationDate || !employee.employeeId) return false;
      const due = Date.parse(employee.evaluationDate);
      return due >= now && due <= windowEnd;
    });

    if (dueSoon.length === 0) {
      return {
        skipped: true,
        reason: "no-evaluations-due",
        checked: employees.length,
      };
    }

    const employeesById = new Map(
      employees.map((employee) => [employee.employeeId, employee]),
    );
    const cardDue = new Date(now + CARD_DUE_DAYS * DAY_MS).toISOString();
    const results: Array<{
      employeeId: string;
      outcome: string;
      error?: string;
    }> = [];

    for (const employee of dueSoon) {
      try {
        const existing = await ctx.step(
          `find-card-${employee.employeeId}`,
          async () =>
            sdk.runAction({
              appKey: "trello",
              actionType: "search",
              actionKey: "organization_card_v2",
              connection: "trello",
              inputs: {
                board: TRELLO_BOARD_ID,
                keyword: employee.name,
                open_cards_only: "true",
              },
            }),
        );
        if (
          (existing.data ?? []).some(
            (card: { name?: string }) => card.name === employee.name,
          )
        ) {
          results.push({
            employeeId: employee.employeeId,
            outcome: "already-exists",
          });
          continue;
        }

        const supervisor = employee.supervisorId
          ? employeesById.get(employee.supervisorId)
          : undefined;
        const members = supervisor?.trelloMemberId
          ? [supervisor.trelloMemberId]
          : [];

        await ctx.step(`create-card-${employee.employeeId}`, async () =>
          sdk.runAction({
            appKey: "trello",
            actionType: "write",
            actionKey: "card_v2",
            connection: "trello",
            inputs: {
              board: TRELLO_BOARD_ID,
              list: TRELLO_LIST_ID,
              name: employee.name,
              due: cardDue,
              checklist_name: CHECKLIST_NAME,
              checklist_items: [
                `${EVALUATION_FORM_URL}?employee=${employee.employeeId}`,
              ],
              ...(members.length ? { member: members } : {}),
            },
          }),
        );
        results.push({ employeeId: employee.employeeId, outcome: "created" });
      } catch (error) {
        results.push({
          employeeId: employee.employeeId,
          outcome: "failed",
          error: String(error),
        });
      }
    }

    return {
      checked: employees.length,
      dueSoon: dueSoon.length,
      created: results.filter((result) => result.outcome === "created").length,
      alreadyExisted: results.filter(
        (result) => result.outcome === "already-exists",
      ).length,
      failed: results.filter((result) => result.outcome === "failed"),
    };
  },
);

export default workflow;
