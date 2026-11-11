import { ask } from "zap-pack";

export const METADATA_LOG_OBJECT = ask(
  "Salesforce object API name of the deployment metadata log (the object whose status changes).",
);
export const BRANCH_OBJECT = ask(
  "Salesforce object API name of the branch record to update.",
);
export const STATUS_FIELD = ask(
  "Metadata log field holding the deployment status; the zap runs when it changes.",
);
// Status value that means the deployment finished.
export const COMPLETED_VALUE = "Completed";
export const BRANCH_REFERENCE_FIELD = ask(
  "Metadata log field holding the reference to the branch record.",
);
export const BRANCH_ID_FIELD = ask(
  "Branch field the reference is matched against (the branch ID).",
);
export const PROCESS_TYPE_FIELD = ask(
  "Metadata log field holding the process type.",
);
// Process type value that marks a deployment.
export const DEPLOYMENT_PROCESS_TYPE = "Deployment";
export const RUN_RESULT_FIELD = ask(
  "Metadata log field holding the run result.",
);
// Run result value that means the run succeeded.
export const SUCCESS_RESULT_VALUE = "Success";
export const ERROR_FIELD = ask(
  "Metadata log field that is filled in when the run errored.",
);
export const RELEASE_TYPE_FIELD = ask(
  "Metadata log field holding the release type (regular or hotfix).",
);
export const DEPLOYMENT_DATE_FIELD = ask(
  "Metadata log field holding the deployment date.",
);
export const PRODUCTION_RELEASE_FIELD = ask(
  "Branch checkbox set to true when the release reaches production.",
);
export const HOTFIX_FIELD = ask(
  "Branch checkbox that records whether the release is a hotfix.",
);
export const LAST_UAT_DEPLOYMENT_FIELD = ask(
  "Branch datetime field for the last UAT deployment.",
);
