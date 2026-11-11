import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  SPREADSHEET_ID,
  WORKSHEET_ID,
  START_DATE_COLUMN,
  TITLE_COLUMN,
  NAME_COLUMN,
  CONTACT_EMAIL_COLUMN,
  MANAGER_NAME_COLUMN,
  MANAGER_EMAIL_COLUMN,
  HIRING_MANAGER_ROLE,
} from "@/config";
import googleSheets from "@/connections/google-sheets";

const sdk = createZapierSdk();

const HiringTeamMember = z
  .object({
    email: z.string().nullable().optional(),
    firstName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    role: z.string().nullable().optional(),
  })
  .loose();

const Application = z
  .object({
    id: z.string(),
    candidate: z
      .object({
        id: z.string().nullable().optional(),
        name: z.string().nullable().optional(),
        primaryEmailAddress: z
          .object({ value: z.string().nullable().optional() })
          .loose()
          .nullable()
          .optional(),
      })
      .loose()
      .nullable()
      .optional(),
    job: z
      .object({ title: z.string().nullable().optional() })
      .loose()
      .nullable()
      .optional(),
    hiringTeam: z.array(HiringTeamMember).nullable().optional(),
  })
  .loose();

const Offer = z
  .object({
    latestVersion: z
      .object({ startDate: z.string().nullable().optional() })
      .loose()
      .nullable()
      .optional(),
  })
  .loose();

const HirePayload = z
  .object({
    application: Application,
    offer: Offer.nullable().optional(),
  })
  .loose();

// Ashby's candidateHire webhook wraps the hire in `data`; accept the body or the unwrapped object.
const InputSchema = z.union([
  HirePayload,
  z.object({ data: HirePayload }).loose(),
]);

const workflow = defineDurable<unknown, unknown>(
  "add-new-hire-rows-to-onboarding-spreadsheet",
  async (ctx, rawInput) => {
    const parsed = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const hire = "data" in parsed ? parsed.data : parsed;
    const { application } = hire;

    const team = application.hiringTeam ?? [];
    const manager =
      team.find((member) => member.role === HIRING_MANAGER_ROLE) ?? team[0];
    const managerName = [manager?.firstName, manager?.lastName]
      .filter(Boolean)
      .join(" ");

    const startDate = hire.offer?.latestVersion?.startDate ?? "";

    const created = await ctx.step(
      `add-onboarding-row-${application.id}`,
      async () =>
        sdk.runAction({
          appKey: "google-sheets",
          actionType: "write",
          actionKey: "add_row",
          connection: googleSheets,
          inputs: {
            spreadsheet: SPREADSHEET_ID,
            worksheet: WORKSHEET_ID,
            [START_DATE_COLUMN]: startDate,
            [TITLE_COLUMN]: application.job?.title ?? "",
            [NAME_COLUMN]: application.candidate?.name ?? "",
            [CONTACT_EMAIL_COLUMN]:
              application.candidate?.primaryEmailAddress?.value ?? "",
            [MANAGER_NAME_COLUMN]: managerName,
            [MANAGER_EMAIL_COLUMN]: manager?.email ?? "",
          },
        }),
    );

    return {
      applicationId: application.id,
      startDate: startDate || null,
      manager: managerName || null,
      row: created.data?.[0] ?? null,
    };
  },
);

export default workflow;
