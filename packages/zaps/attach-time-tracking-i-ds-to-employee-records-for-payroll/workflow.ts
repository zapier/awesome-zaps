import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Airtable base ID (the "app..." part of the base URL).
const AIRTABLE_BASE_ID = "YOUR_AIRTABLE_BASE_ID";
// Name of the Airtable table that holds employee records.
const EMPLOYEE_TABLE = "YOUR_EMPLOYEE_TABLE_NAME";
// Employee column matched first, against the entry's email.
const EMAIL_FIELD = "YOUR_EMAIL_FIELD";
// Employee column matched as fallback, against the entry's full name (exact match).
const FULL_NAME_FIELD = "YOUR_FULL_NAME_FIELD";
// Multi-link column the time-tracking record ID is appended to. Existing links are kept.
const TIME_TRACKING_LINK_FIELD = "YOUR_TIME_TRACKING_LINK_FIELD";

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

const workflow = defineDurable<unknown, unknown>(
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

        let employee = null;
        let matchedBy = null;

        if (email) {
          const byEmail = await ctx.step(
            `find-employee-by-email-${index}`,
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
          employee = byEmail.data?.[0] ?? null;
          matchedBy = employee ? "email" : null;
        }

        if (!employee && fullName) {
          const byName = await ctx.step(
            `find-employee-by-name-${index}`,
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
          employee = byName.data?.[0] ?? null;
          matchedBy = employee ? "name" : null;
        }

        // No match: skip rather than create a record.
        if (!employee?.id) {
          outcomes.push({ index, skipped: true, reason: "no-match" });
          continue;
        }

        // Keep existing links and append the new ID, without duplicates.
        const existing = Array.isArray(
          employee.fields?.[TIME_TRACKING_LINK_FIELD],
        )
          ? employee.fields[TIME_TRACKING_LINK_FIELD].map(String)
          : [];
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

        const update = await ctx.step(
          `link-time-tracking-id-${index}`,
          async () =>
            sdk.runAction({
              appKey: "airtable",
              actionType: "write",
              actionKey: "updateRecord",
              connection: "airtable",
              inputs: {
                applicationId: AIRTABLE_BASE_ID,
                tableName: EMPLOYEE_TABLE,
                rowId: String(employee.id),
                [TIME_TRACKING_LINK_FIELD]: combined,
              },
            }),
        );

        outcomes.push({
          index,
          linked: true,
          matchedBy,
          employeeId: employee.id,
          updated: update.data?.[0]?.id ?? null,
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
