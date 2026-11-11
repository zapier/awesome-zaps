import { ask } from "zap-pack";

export const QUO_FROM_PHONE_NUMBER_ID = ask(
  'Quo phone number ID the acknowledgement SMS is sent from (the "From" line).',
);
export const TABLE_ID = ask(
  "Zapier Table ID of the central weight log (the table the rows are added to).",
);
// Acknowledgement SMS; {weight} is replaced with the logged value.
export const ACK_TEMPLATE = "Thanks, logged your weight: {weight}.";
