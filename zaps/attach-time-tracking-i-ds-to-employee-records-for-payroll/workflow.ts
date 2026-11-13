import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  AIRTABLE_BASE_ID,
  EMPLOYEE_TABLE,
  EMAIL_FIELD,
  FULL_NAME_FIELD,
  TIME_TRACKING_LINK_FIELD,
} from "./config.ts";

const sdk = createZapierSdk();

const EntrySchema = z
  .object({
    record_id: z.union([z.string(), z.number()]).nullable().optional(),
    email: z.string().nullable().optional(),
    full_name: z.string().nullable().optional(),
  })
  .loose();

const InputSchema = z
  .object({
    records: z.array(EntrySchema).nullable().optional(),
  })
  .loose();

// The Airtable record shape the find and update steps return, as this zap reads it.
type EmployeeRecord = {
  id?: string | number;
  fields?: Record<string, unknown>;
};

const workflow = defineDurable(
  "attach-time-tracking-i-ds-to-employee-records-for-payroll",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const entries = input.records ?? [];

    const outcomes = [];
    for (const [index, entry] of entries.entries()) {
      try {
        const recordId = String(entry.record_id ?? "").trim();
        const email = (entry.email ?? "").trim();
        const fullName = (entry.full_name ?? "").trim();
        if (!recordId || (!email && !fullName)) {
          outcomes.push({ index, skipped: true, reason: "missing-fields" });
          continue;
        }

        let employee: EmployeeRecord | null = null;
        let matchedBy = null;

        if (email) {
          const byEmail = await ctx.step(
            `find-employee-by-email-${recordId}`,
            async () =>
              sdk.runAction({
                appKey: "airtable",
                actionType: "search",
                actionKey: "findRecord",
                connection: "airtable",
                inputs: {
                  applicationId: AIRTABLE_BASE_ID,
                  tableName: EMPLOYEE_TABLE,
                  searchByField: EMAIL_FIELD,
                  searchByValue: email,
                  isExactMatch: true,
                },
              }),
          );
          employee = (byEmail.data?.[0] as EmployeeRecord | undefined) ?? null;
          matchedBy = employee ? "email" : null;
        }

        if (!employee && fullName) {
          const byName = await ctx.step(
            `find-employee-by-name-${recordId}`,
            async () =>
              sdk.runAction({
                appKey: "airtable",
                actionType: "search",
                actionKey: "findRecord",
                connection: "airtable",
                inputs: {
                  applicationId: AIRTABLE_BASE_ID,
                  tableName: EMPLOYEE_TABLE,
                  searchByField: FULL_NAME_FIELD,
                  searchByValue: fullName,
                  isExactMatch: true,
                },
              }),
          );
          employee = (byName.data?.[0] as EmployeeRecord | undefined) ?? null;
          matchedBy = employee ? "name" : null;
        }

        // No match: skip rather than create a record.
        if (!employee?.id) {
          outcomes.push({ index, skipped: true, reason: "no-match" });
          continue;
        }

        // Keep existing links and append the new ID, without duplicates.
        const linkedIds = employee.fields?.[TIME_TRACKING_LINK_FIELD];
        const existing = Array.isArray(linkedIds) ? linkedIds.map(String) : [];
        if (existing.includes(recordId)) {
          outcomes.push({
            index,
            skipped: true,
            reason: "already-linked",
            matchedBy,
          });
          continue;
        }
        const combined = [...existing, recordId];
        const employeeId = String(employee.id);

        const update = await ctx.step(
          `link-time-tracking-id-${recordId}`,
          async () =>
            sdk.runAction({
              appKey: "airtable",
              actionType: "write",
              actionKey: "updateRecord",
              connection: "airtable",
              inputs: {
                applicationId: AIRTABLE_BASE_ID,
                tableName: EMPLOYEE_TABLE,
                rowId: employeeId,
                [TIME_TRACKING_LINK_FIELD]: combined,
              },
            }),
        );
        const updated = update.data?.[0] as { id?: unknown } | undefined;

        outcomes.push({
          index,
          linked: true,
          matchedBy,
          employeeId: employee.id,
          updated: updated?.id ?? null,
        });
      } catch (error) {
        outcomes.push({
          index,
          failed: true,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return {
      total: entries.length,
      linked: outcomes.filter((o) => "linked" in o).length,
      skipped: outcomes.filter((o) => "skipped" in o).length,
      failed: outcomes.filter((o) => "failed" in o).length,
      outcomes,
    };
  },
);

export default workflow;
