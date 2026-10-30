import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// OKR endpoint that returns the goal list as a JSON array (replace with your URL).
const OKR_ENDPOINT_URL = "YOUR_OKR_ENDPOINT_URL";
// Salesforce API name of the Strategic Plan object.
const STRATEGIC_PLAN_OBJECT = "Strategic_Plan__c";
// Salesforce field that stores the external OKR ID used to match records.
const EXTERNAL_ID_FIELD = "External_OKR_ID__c";
// Fiscal year written to records this workflow creates.
const FISCAL_YEAR = "FY26";
// Salesforce field API names for the mapped values.
const FIELDS = {
  name: "Name",
  endDate: "End_Date__c",
  status: "Status__c",
  percentComplete: "Percent_Complete__c",
  initiativeType: "Initiative_Type__c",
  fiscalYear: "Fiscal_Year__c",
};

const GoalSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    title: z.string().nullable().optional(),
    due_date: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    percent_complete: z.number().nullable().optional(),
    type: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "update-strategic-plan-records-from-daily-okr-snapshot",
  async (ctx) => {
    const goals = await ctx.step("fetch-okr-goals", async () => {
      const response = await sdk.runAction({
        appKey: "webhook",
        actionType: "write",
        actionKey: "get",
        inputs: { url: OKR_ENDPOINT_URL },
      });
      const content = response.data[0]?.content;
      return z.array(GoalSchema).parse(JSON.parse(String(content ?? "[]")));
    });

    let created = 0;
    let updated = 0;
    let failed = 0;

    for (const [index, goal] of goals.entries()) {
      try {
        const externalId = String(goal.id).trim();
        const fields = {
          [FIELDS.name]: goal.title ?? null,
          [FIELDS.endDate]: goal.due_date ?? null,
          [FIELDS.status]: goal.status ?? null,
          [FIELDS.percentComplete]: goal.percent_complete ?? null,
          [FIELDS.initiativeType]: goal.type ?? null,
        };

        const match = await ctx.step(`find-strategic-plan-${index}`, async () =>
          sdk.runAction({
            appKey: "salesforce",
            actionType: "search",
            actionKey: "find_record_by_query",
            connection: "salesforce",
            inputs: {
              object: STRATEGIC_PLAN_OBJECT,
              whereClause: `${EXTERNAL_ID_FIELD} = '${externalId.replace(/'/g, "\\'")}'`,
              limit: 1,
            },
          }),
        );

        const existing = match.data[0] as { Id?: string } | undefined;
        if (existing?.Id) {
          const recordId = existing.Id;
          await ctx.step(`update-strategic-plan-${index}`, async () =>
            sdk.runAction({
              appKey: "salesforce",
              actionType: "write",
              actionKey: "update_record_utc",
              connection: "salesforce",
              inputs: {
                object: STRATEGIC_PLAN_OBJECT,
                record_id: recordId,
                ...fields,
              },
            }),
          );
          updated += 1;
        } else {
          await ctx.step(`create-strategic-plan-${index}`, async () =>
            sdk.runAction({
              appKey: "salesforce",
              actionType: "write",
              actionKey: "create_record_utc",
              connection: "salesforce",
              inputs: {
                object: STRATEGIC_PLAN_OBJECT,
                ...fields,
                [EXTERNAL_ID_FIELD]: externalId,
                [FIELDS.fiscalYear]: FISCAL_YEAR,
              },
            }),
          );
          created += 1;
        }
      } catch {
        failed += 1;
      }
    }

    return { goals: goals.length, created, updated, failed };
  },
);

export default workflow;
