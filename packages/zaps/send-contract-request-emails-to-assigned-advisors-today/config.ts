import { ask } from "zap-pack";

export const SPREADSHEET_ID = ask(
  "Google Sheets spreadsheet ID (the long ID in the sheet's URL).",
);
// Worksheet (tab) ID; the first tab is "0".
export const WORKSHEET_ID = "0";
// Row field holding the assigned advisor's email address (the To recipient).
export const ADVISOR_EMAIL_FIELD = "advisor_email";
// Row fields used to build the subject line.
export const ORGANIZATION_FIELD = "organization";
export const TITLE_FIELD = "title";
export const DATE_FIELD = "date";
// Row fields placed in the email body.
export const PLANNER_FIELD = "planner";
export const REQUEST_DETAILS_FIELD = "request_details";
// Sender address for shared-mailbox sends; leave "" to send from the connected Outlook account.
export const SENDER_ADDRESS = "";
