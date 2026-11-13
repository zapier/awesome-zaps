---
name: notify-team-of-new-tagged-instagram-post-immediately-to-channel
description: Build a Zap on Zapier that posts an alert to a team Slack channel as soon as the business's Instagram account is tagged in a post, with the author, caption, link and a media preview. Use when a marketing or community team wants to review, re-share or confirm usage rights for tagged content quickly, without watching Instagram by hand.
license: MIT
metadata:
  author: zapier
  summary: "When someone tags your Instagram account, your team gets a Slack message with who tagged you, the caption, a link to the post and a preview, so coordinators can act on it right away."
  apps: "Instagram for Business, Slack"
  category: "Marketing"
  job: "Social media marketing"
  source: "https://zapier.com/automations/marketing/social-media-marketing/social-media-monitoring/notify-team-of-new-tagged-instagram-post-immediately-to-channel"
---

# Notify team of new tagged Instagram post immediately to channel

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/notify-team-of-new-tagged-instagram-post-immediately-to-channel. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** someone tags the business's Instagram account in a new post (`instagram-for-business`, `new_tag`). The trigger brings the author's username, the caption, the post's link and its media.
2. **Slack** posts one message to the team channel. It names the author (`@username`), includes the caption (cut to a set length), the link to the post, and a media preview. The message posts under a bot name and icon.

Nothing is filtered: every tagged post produces one message, and the message mentions nobody unless mentions are turned on.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve channel and group names to IDs with the user's own Slack connection; don't ask them to paste an ID you can look up.

| Setting                 | What goes there                                                                                |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| `REPLACE_SLACK_CHANNEL` | The channel that gets the alerts, by its ID (`C…`). The Slack bot must be added to it.         |
| `REPLACE_GROUP_ID`      | The Slack user group to mention, by its ID (`S…`). Needed only if `MENTION_ENABLED` is `true`. |

Which Instagram business account to watch is set on the trigger through the `instagram-for-business` connection. It must be an admin's Instagram Business account linked to a Facebook Page.

Also review the defaults with them: `BOT_NAME` and `BOT_ICON` (how the bot appears), `MENTION_ENABLED` (`false` in `workflow.ts`, so no one is mentioned unless they ask), and `MAX_CAPTION_LENGTH` (280 characters in `workflow.ts`).

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `instagram-for-business` to the user's Instagram Business account whose tags are watched (the trigger uses it), and `slack` to the user's Slack connection for the workspace with the alert channel. No other apps need a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-tag.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with a sample that matches what the trigger returns, posted to a channel the user controls:

```json
{
  "username": "example_creator",
  "caption": "Loving the new spring collection from @yourbrand #springstyle",
  "permalink": "https://www.instagram.com/p/EXAMPLE123/",
  "media_url": "https://example.com/media/EXAMPLE123.jpg",
  "media_type": "IMAGE",
  "thumbnail_url": null
}
```

Check that one message appears in the channel: the bot name and icon are set, the text names `@example_creator`, includes the caption and the permalink, and shows the picture as an attachment. If run-status tools aren't available, check the channel in Slack directly. Then publish, confirm the trigger is active, and ask the user to delete the test message. The user deletes test data, not the agent.

## Notes

- Every tag alerts, because Instagram does not report whether a tagged post is public. To alert only on public posts, or only on posts with a minimum engagement or specific hashtags, add a check before the Slack step.
- To mention a group on every alert, set `MENTION_ENABLED` to `true` and fill in `REPLACE_GROUP_ID`. To pick the group by hashtag instead, add a rule before the Slack step.
- The trigger returns the username but not a display name, so the alert shows `@username`.
- A video's preview is its thumbnail; a photo's preview is the image itself.
- The Slack bot can post only in channels it has been added to. The message includes a link to the automation for editing unless the Slack action's "Include a link to this automation" option is turned off.
