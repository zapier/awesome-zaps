import { ask } from "zap-pack";

export const MAIL_IDENTIFIER = ask(
  "Zapier Mail address name (the part before @zapiermail.com) that receives forwarded requests.",
);
export const TRELLO_BOARD_ID = ask(
  "Trello board ID that holds the design project board.",
);
export const TRELLO_INTAKE_LIST_ID = ask(
  "Trello intake list ID; new cards are placed at the bottom of this list.",
);
