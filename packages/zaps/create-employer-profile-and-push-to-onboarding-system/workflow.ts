import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Zapier Tables ID of the onboarding table (the ID in the table's URL).
const ONBOARDING_TABLE_ID = "YOUR_ONBOARDING_TABLE_ID";
// Onboarding/payroll API endpoint that receives each new profile. Until this is a real https URL, the run skips.
const ONBOARDING_API_URL = "YOUR_ONBOARDING_API_URL";
// Bearer token for the onboarding API. Replaces the spec's sub-flow token lookup, which has no equivalent here.
const ONBOARDING_API_TOKEN = "YOUR_ONBOARDING_API_TOKEN";
// Salesforce object the trigger watches.
const SALESFORCE_OBJECT = "Account";
// Salesforce custom field that stores the Sector value (change to match your org).
const SALESFORCE_SECTOR_FIELD = "Sector__c";
// Salesforce custom field that receives the onboarding system's external ID (change to match your org).
const SALESFORCE_EXTERNAL_ID_FIELD = "YOUR_SALESFORCE_EXTERNAL_ID_FIELD";
// Salesforce custom field that receives the sync status (change to match your org).
const SALESFORCE_SYNC_STATUS_FIELD = "YOUR_SALESFORCE_SYNC_STATUS_FIELD";
// Status written to each new onboarding record until the API confirms it.
const INITIAL_STATUS = "In Progress";

const InputSchema = z
  .object({
    Id: z.string(),
    Name: z.string().nullable().optional(),
    OwnerId: z.string().nullable().optional(),
    Website: z.string().nullable().optional(),
    Phone: z.string().nullable().optional(),
    Industry: z.string().nullable().optional(),
    [SALESFORCE_SECTOR_FIELD]: z.string().nullable().optional(),
    NumberOfEmployees: z.union([z.string(), z.number()]).nullable().optional(),
    Description: z.string().nullable().optional(),
    BillingStreet: z.string().nullable().optional(),
    BillingCity: z.string().nullable().optional(),
    BillingState: z.string().nullable().optional(),
    BillingPostalCode: z.string().nullable().optional(),
    BillingCountry: z.string().nullable().optional(),
  })
  .loose();

// Multi-select picklists arrive as "A;B;C". Output is "A, B, C".
const readableList = (value: string | null | undefined) =>
  (value ?? "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .join(", ");

// Employee counts can arrive as "1,200" or 1200. Anything that is not a positive number becomes null.
const employeeCount = (value: string | number | null | undefined) => {
  const count = Number(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(count) && count > 0 ? count : null;
};

const workflow = defineDurable<unknown, unknown>(
  "create-employer-profile-and-push-to-onboarding-system",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    if (!ONBOARDING_API_URL.startsWith("https://")) {
      return {
        skipped: true,
        reason: "onboarding-api-url-not-set",
        accountId: input.Id,
      };
    }

    const owner = input.OwnerId
      ? await ctx.step("find-account-owner", async () =>
          sdk.runAction({
            appKey: "salesforce",
            actionType: "search",
            actionKey: "find_record",
            connection: "salesforce",
            inputs: {
              object: "User",
              searchField: "Id",
              searchValue: input.OwnerId,
            },
          }),
        )
      : null;
    const ownerEmail =
      (owner?.data?.[0] as { Email?: string } | undefined)?.Email ?? "";

    const address = [
      input.BillingStreet,
      input.BillingCity,
      input.BillingState,
      input.BillingPostalCode,
      input.BillingCountry,
    ]
      .filter(Boolean)
      .join(", ");
    const industries = readableList(input.Industry);
    const sectors = readableList(
      input[SALESFORCE_SECTOR_FIELD] as string | null | undefined,
    );
    const employees = employeeCount(input.NumberOfEmployees);

    const record = await ctx.step("create-onboarding-record", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "write",
        actionKey: "create_record",
        connection: "zapier-tables",
        inputs: {
          table_id: ONBOARDING_TABLE_ID,
          Title: input.Name ?? "",
          "Owner email": ownerEmail,
          Website: input.Website ?? "",
          Phone: input.Phone ?? "",
          Address: address,
          Industries: industries,
          Sectors: sectors,
          Notes: input.Description ?? "",
          "CRM account ID": input.Id,
          Status: INITIAL_STATUS,
        },
      }),
    );
    const recordId = record.data?.[0]?.id;

    const posted = await ctx.step("post-to-onboarding-api", async () =>
      sdk.runAction({
        appKey: "webhook",
        actionType: "write",
        actionKey: "post",
        inputs: {
          url: ONBOARDING_API_URL,
          payload_type: "json",
          headers: { Authorization: `Bearer ${ONBOARDING_API_TOKEN}` },
          data: {
            crmAccountId: input.Id,
            companyName: input.Name ?? "",
            ownerEmail,
            website: input.Website ?? "",
            phone: input.Phone ?? "",
            address,
            industries,
            sectors,
            employeeCount: employees,
            notes: input.Description ?? "",
          },
          unflatten: "no",
          extract_variables: "no",
        },
      }),
    );
    const externalId = posted.data?.[0]?.id;
    const syncStatus = externalId ? "Synced" : "Failed";

    await ctx.step("update-onboarding-record", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "write",
        actionKey: "update_record",
        connection: "zapier-tables",
        inputs: {
          table_id: ONBOARDING_TABLE_ID,
          record_id: recordId,
          "External ID": externalId ?? "",
          Status: syncStatus,
        },
      }),
    );

    await ctx.step("update-crm-sync-status", async () =>
      sdk.runAction({
        appKey: "salesforce",
        actionType: "write",
        actionKey: "update_record",
        connection: "salesforce",
        inputs: {
          object: SALESFORCE_OBJECT,
          record_id: input.Id,
          [SALESFORCE_EXTERNAL_ID_FIELD]: externalId ?? "",
          [SALESFORCE_SYNC_STATUS_FIELD]: syncStatus,
        },
      }),
    );

    return { accountId: input.Id, recordId, externalId, syncStatus, employees };
  },
);

export default workflow;
