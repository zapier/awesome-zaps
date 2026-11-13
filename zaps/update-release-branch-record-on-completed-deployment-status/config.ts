// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const METADATA_LOG_OBJECT = "REPLACE_METADATA_LOG_OBJECT"; // Ask the user for the Salesforce API name of the deployment metadata log object, the one whose status changes.
export const BRANCH_OBJECT = "REPLACE_BRANCH_OBJECT"; // Ask the user for the Salesforce API name of the branch object whose record gets updated.
export const STATUS_FIELD = "REPLACE_STATUS_FIELD"; // Ask the user for the API name of the metadata log field that holds the deployment status; the zap runs when it changes.
export const BRANCH_REFERENCE_FIELD = "REPLACE_BRANCH_REFERENCE_FIELD"; // Ask the user for the API name of the metadata log field that references the branch record.
export const BRANCH_ID_FIELD = "REPLACE_BRANCH_ID_FIELD"; // Ask the user which branch field the reference is matched against, usually the branch ID.
export const PROCESS_TYPE_FIELD = "REPLACE_PROCESS_TYPE_FIELD"; // Ask the user for the API name of the metadata log field that holds the process type.
export const RUN_RESULT_FIELD = "REPLACE_RUN_RESULT_FIELD"; // Ask the user for the API name of the metadata log field that holds the run result.
export const ERROR_FIELD = "REPLACE_ERROR_FIELD"; // Ask the user for the API name of the metadata log field that is filled in when the run errored.
export const RELEASE_TYPE_FIELD = "REPLACE_RELEASE_TYPE_FIELD"; // Ask the user for the API name of the metadata log field that holds the release type, regular or hotfix.
export const DEPLOYMENT_DATE_FIELD = "REPLACE_DEPLOYMENT_DATE_FIELD"; // Ask the user for the API name of the metadata log field that holds the deployment date.
export const PRODUCTION_RELEASE_FIELD = "REPLACE_PRODUCTION_RELEASE_FIELD"; // Ask the user for the API name of the branch checkbox that is set to true when the release reaches production.
export const HOTFIX_FIELD = "REPLACE_HOTFIX_FIELD"; // Ask the user for the API name of the branch checkbox that records whether the release is a hotfix.
export const LAST_UAT_DEPLOYMENT_FIELD = "REPLACE_LAST_UAT_DEPLOYMENT_FIELD"; // Ask the user for the API name of the branch datetime field that holds the last UAT deployment.

// Status value that means the deployment finished.
export const COMPLETED_VALUE = "Completed";
// Process type value that marks a deployment.
export const DEPLOYMENT_PROCESS_TYPE = "Deployment";
// Run result value that means the run succeeded.
export const SUCCESS_RESULT_VALUE = "Success";
