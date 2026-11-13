// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const MAIL_IDENTIFIER = "REPLACE_MAIL_IDENTIFIER"; // Ask the user which name the request mailbox uses: the part before @zapiermail.com, lowercase letters and numbers only. The trigger uses the same value.
export const TRELLO_BOARD_ID = "REPLACE_TRELLO_BOARD_ID"; // Look up with the user's Trello connection the design project board, then use its ID.
export const TRELLO_INTAKE_LIST_ID = "REPLACE_TRELLO_INTAKE_LIST_ID"; // Ask the user which list takes new requests, then look up its ID with their Trello connection. New cards go to the bottom of it.
