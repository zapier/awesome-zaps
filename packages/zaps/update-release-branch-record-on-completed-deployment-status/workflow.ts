import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Salesforce object API name of the deployment metadata log (the object whose status changes).
const METADATA_LOG_OBJECT = "YOUR_METADATA_LOG_OBJECT";
// Salesforce object API name of the branch record to update.
const BRANCH_OBJECT = "YOUR_BRANCH_OBJECT";
// Metadata log field holding the deployment status; the zap runs when it changes.
const STATUS_FIELD = "YOUR_STATUS_FIELD";
// Status value that means the deployment finished.
const COMPLETED_VALUE = "Completed";
// Metadata log field holding the reference to the branch record.
const BRANCH_REFERENCE_FIELD = "YOUR_BRANCH_REFERENCE_FIELD";
// Branch field the reference is matched against (the branch ID).
const BRANCH_ID_FIELD = "YOUR_BRANCH_ID_FIELD";
// Metadata log field holding the process type.
const PROCESS_TYPE_FIELD = "YOUR_PROCESS_TYPE_FIELD";
// Process type value that marks a deployment.
const DEPLOYMENT_PROCESS_TYPE = "Deployment";
// Metadata log field holding the run result.
const RUN_RESULT_FIELD = "YOUR_RUN_RESULT_FIELD";
// Run result value that means the run succeeded.
const SUCCESS_RESULT_VALUE = "Success";
// Metadata log field that is filled in when the run errored.
const ERROR_FIELD = "YOUR_ERROR_FIELD";
// Metadata log field holding the release type (regular or hotfix).
const RELEASE_TYPE_FIELD = "YOUR_RELEASE_TYPE_FIELD";
// Release type value to hotfix flag, one entry per value. Missing or unlisted values count as regular (false).
const HOTFIX_LOOKUP: Record<string, boolean> = {
  Regular: false,
  Hotfix: true,
};
// Metadata log field holding the deployment date.
const DEPLOYMENT_DATE_FIELD = "YOUR_DEPLOYMENT_DATE_FIELD";
// Branch checkbox set to true when the release reaches production.
const PRODUCTION_RELEASE_FIELD = "YOUR_PRODUCTION_RELEASE_FIELD";
// Branch checkbox that records whether the release is a hotfix.
const HOTFIX_FIELD = "YOUR_HOTFIX_FIELD";
// Branch datetime field for the last UAT deployment.
const LAST_UAT_DEPLOYMENT_FIELD = "YOUR_LAST_UAT_DEPLOYMENT_FIELD";

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
        connection: "salesforce",
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
        connection: "salesforce",
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
