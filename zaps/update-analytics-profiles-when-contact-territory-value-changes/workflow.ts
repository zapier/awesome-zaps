import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  SPREADSHEET_ID,
  WORKSHEET_ID,
  TERRITORY_PROPERTY,
  TERRITORY_HEADER,
  CRM_ID_COLUMN,
  EMAIL_COLUMN,
  TERRITORY_COLUMN,
  LIFECYCLE_COLUMN,
  UPDATED_AT_COLUMN,
} from "./config.ts";

const sdk = createZapierSdk();

// Lifecycle stages that count as not active. Contacts in these stages are skipped.
const INACTIVE_STAGES = ["unsubscribed", "other"];

const InputSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
  })
  .loose();

const workflow = defineDurable(
  "update-analytics-profiles-when-contact-territory-value-changes",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const contactId = String(input.id).trim();

    const contact = await ctx.step("get-hubspot-contact", async () =>
      sdk.runAction({
        appKey: "hubspot",
        actionType: "write",
        actionKey: "get_contact_by_id",
        connection: "hubspot",
        inputs: {
          id: contactId,
          properties_to_retrieve: [
            TERRITORY_PROPERTY,
            "lifecyclestage",
            "email",
          ],
        },
      }),
    );

    const record = (contact.data?.[0] ?? {}) as Record<string, unknown>;
    const stage = String(record.lifecyclestage ?? "");
    if (INACTIVE_STAGES.includes(stage)) {
      return { skipped: true, reason: "inactive-contact", contactId };
    }

    const territory = String(record[TERRITORY_PROPERTY] ?? "");
    const email = String(record.email ?? "");

    const byCrmId = await ctx.step("find-profile-by-crm-id", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "search",
        actionKey: "lookup_row",
        connection: "google-sheets",
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          lookup_key: CRM_ID_COLUMN,
          lookup_value: contactId,
        },
      }),
    );

    let profile = byCrmId.data?.[0] as Record<string, unknown> | undefined;

    if (!profile?.id && email) {
      const byEmail = await ctx.step("find-profile-by-email", async () =>
        sdk.runAction({
          appKey: "google-sheets",
          actionType: "search",
          actionKey: "lookup_row",
          connection: "google-sheets",
          inputs: {
            spreadsheet: SPREADSHEET_ID,
            worksheet: WORKSHEET_ID,
            lookup_key: EMAIL_COLUMN,
            lookup_value: email,
          },
        }),
      );
      profile = byEmail.data?.[0] as Record<string, unknown> | undefined;
    }

    if (profile && String(profile[TERRITORY_HEADER] ?? "") === territory) {
      return { skipped: true, reason: "territory-unchanged", contactId };
    }

    const updatedAt = await ctx.step("capture-updated-at", async () =>
      new Date().toISOString(),
    );

    const values = {
      [CRM_ID_COLUMN]: contactId,
      [EMAIL_COLUMN]: email,
      [TERRITORY_COLUMN]: territory,
      [LIFECYCLE_COLUMN]: stage,
      [UPDATED_AT_COLUMN]: updatedAt,
    };

    if (profile?.id) {
      const updated = await ctx.step("update-analytics-profile", async () =>
        sdk.runAction({
          appKey: "google-sheets",
          actionType: "write",
          actionKey: "update_row",
          connection: "google-sheets",
          inputs: {
            spreadsheet: SPREADSHEET_ID,
            worksheet: WORKSHEET_ID,
            row: String(profile.id),
            ...values,
          },
        }),
      );
      return {
        contactId,
        action: "updated",
        row: profile.id,
        updatedAt,
        result: updated.data?.[0] ?? null,
      };
    }

    const created = await ctx.step("create-analytics-profile", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "write",
        actionKey: "add_row",
        connection: "google-sheets",
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          ...values,
        },
      }),
    );

    return {
      contactId,
      action: "created",
      updatedAt,
      result: created.data?.[0] ?? null,
    };
  },
);

export default workflow;
