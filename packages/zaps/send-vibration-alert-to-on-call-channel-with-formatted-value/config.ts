import { ask } from "zap-pack";

export const ON_CALL_CHAT_ID = ask(
  'Telegram chat ID of the on-call chat or group (for example "-1001234567890" or "@your_channel"). The bot must be a member of the chat.',
);
// Telegram username to mention when MENTION_ON_CALL is true.
export const ON_CALL_MENTION = "@YOUR_ON_CALL_USERNAME";
