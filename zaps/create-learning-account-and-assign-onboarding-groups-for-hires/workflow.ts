import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import { NOTIFY_NEW_USER } from "@/config";
import go1 from "@/connections/go1";

const sdk = createZapierSdk();

// BambooHR location names that count as local hires. Every other location routes to the international groups.
const LOCAL_LOCATIONS = ["YOUR_LOCAL_LOCATION"];
// Go1 group IDs per BambooHR division, split into local and international hires. A division not listed here is skipped.
const GROUPS_BY_DIVISION: Record<
  string,
  { local: string[]; international: string[] }
> = {
  YOUR_DIVISION: {
    local: ["YOUR_LOCAL_GROUP_ID"],
    international: ["YOUR_INTERNATIONAL_GROUP_ID"],
  },
};

const InputSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    workEmail: z.string().nullable().optional(),
    firstName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    division: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "create-learning-account-and-assign-onboarding-groups-for-hires",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const employeeId = String(input.id);
    const email = (input.workEmail ?? "").trim();
    if (!email) {
      return { skipped: true, reason: "no-work-email", employeeId };
    }

    const division = (input.division ?? "").trim();
    const location = (input.location ?? "").trim();
    const divisionGroups = GROUPS_BY_DIVISION[division];
    if (!divisionGroups) {
      return {
        skipped: true,
        reason: "division-not-mapped",
        employeeId,
        division,
      };
    }
    const path = LOCAL_LOCATIONS.includes(location) ? "local" : "international";
    const groupIds = divisionGroups[path];

    const existing = await ctx.step(`find-go1-user-${employeeId}`, async () =>
      sdk.runAction({
        appKey: "go1",
        actionType: "search",
        actionKey: "find_user",
        connection: go1,
        inputs: { email },
      }),
    );

    const created = existing.data?.[0]
      ? null
      : await ctx.step(`create-go1-user-${employeeId}`, async () =>
          sdk.runAction({
            appKey: "go1",
            actionType: "write",
            actionKey: "create_user",
            connection: go1,
            inputs: {
              email,
              first_name: input.firstName ?? "",
              last_name: input.lastName ?? "",
              notify: NOTIFY_NEW_USER,
            },
          }),
        );

    const assignment = await ctx.step(
      `assign-go1-groups-${employeeId}`,
      async () =>
        sdk.runAction({
          appKey: "go1",
          actionType: "write",
          actionKey: "assign_group",
          connection: go1,
          inputs: { email, id: groupIds },
        }),
    );

    return {
      employeeId,
      email,
      division,
      path,
      groupIds,
      userCreated: created !== null,
      assigned: assignment.data?.[0] ?? null,
    };
  },
);

export default workflow;
