import { ask } from "zap-pack";

export const RECIPIENT = ask(
  "Who receives the reminder: a stakeholder address or a distribution list.",
);
// Board meeting name, used in the subject and body.
export const MEETING_TITLE = "Board meeting";
export const MEETING_DATE = ask(
  "Board meeting date, written the way you want it to read in the email.",
);
export const AGENDA_LINK = ask(
  "Link to the agenda and packet submission page. If empty, no reminder is sent.",
);
