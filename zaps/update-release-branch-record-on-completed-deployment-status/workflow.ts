import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  BRANCH_OBJECT,
  STATUS_FIELD,
  COMPLETED_VALUE,
  BRANCH_REFERENCE_FIELD,
  BRANCH_ID_FIELD,
  PROCESS_TYPE_FIELD,
  DEPLOYMENT_PROCESS_TYPE,
  RUN_RESULT_FIELD,
  SUCCESS_RESULT_VALUE,
  ERROR_FIELD,
  RELEASE_TYPE_FIELD,
  DEPLOYMENT_DATE_FIELD,
  PRODUCTION_RELEASE_FIELD,
  HOTFIX_FIELD,
  LAST_UAT_DEPLOYMENT_FIELD,
} from "@/config";
import salesforce from "@/connections/salesforce";

const sdk = createZapierSdk();

// Release type value to hotfix flag, one entry per value. Missing or unlisted values count as regular (false).
const HOTFIX_LOOKUP: Record<string, boolean> = {
  Regular: false,
  Hotfix: true,
};

const InputSchema = z.looseObject({});

const workflow = defineDurable<unknown, unknown>(
  "update-release-branch-record-on-completed-deployment-status",
  async (ctx, rawInput) => {
    const log = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    if (log[STATUS_FIELD] !== COMPLETED_VALUE) {
      return { skipped: true, reason: "status-not-completed" };
    }

    const isDeployment = log[PROCESS_TYPE_FIELD] === DEPLOYMENT_PROCESS_TYPE;
    const isSuccessful = log[RUN_RESULT_FIELD] === SUCCESS_RESULT_VALUE;
    const hasError = Boolean(log[ERROR_FIELD]);
    if (!isDeployment || !isSuccessful || hasError) {
      return { skipped: true, reason: "not-a-successful-deployment" };
    }

    const branchReference = String(log[BRANCH_REFERENCE_FIELD] ?? "").trim();
    if (!branchReference) {
      return { skipped: true, reason: "no-branch-reference" };
    }

    const lookup = await ctx.step("find-branch-record", async () =>
      sdk.runAction({
        appKey: "salesforce",
        actionType: "search",
        actionKey: "find_record",
        connection: salesforce,
        inputs: {
          object: BRANCH_OBJECT,
          searchField: BRANCH_ID_FIELD,
          searchValue: branchReference,
        },
      }),
    );

    const branch = lookup.data?.[0] as { id?: string } | undefined;
    if (!branch?.id) {
      return { skipped: true, reason: "branch-not-found", branchReference };
    }

    const isHotfix =
      HOTFIX_LOOKUP[String(log[RELEASE_TYPE_FIELD] ?? "")] ?? false;

    const update = await ctx.step("update-branch-record", async () =>
      sdk.runAction({
        appKey: "salesforce",
        actionType: "write",
        actionKey: "update_record",
        connection: salesforce,
        inputs: {
          object: BRANCH_OBJECT,
          record_id: branch.id,
          [PRODUCTION_RELEASE_FIELD]: true,
          [HOTFIX_FIELD]: isHotfix,
          [LAST_UAT_DEPLOYMENT_FIELD]: log[DEPLOYMENT_DATE_FIELD],
        },
      }),
    );

    return {
      branchId: branch.id,
      hotfix: isHotfix,
      updated: update.data?.[0] ?? null,
    };
  },
);

export default workflow;
