---
name: notify-team-of-new-tagged-instagram-post-immediately-to-channel
description: Build a Zapier Next Gen Zap that posts an alert to a team Slack channel as soon as the business's Instagram account is tagged in a post, with the author, caption, link and a media preview. Use when a marketing or community team wants to review, re-share or confirm usage rights for tagged content quickly, without watching Instagram by hand.
metadata:
  author: zapier
  summary: "When someone tags your Instagram account, your team gets a Slack message with who tagged you, the caption, a link to the post and a preview, so coordinators can act on it right away."
  apps: "Instagram for Business, Slack"
  category: "Marketing"
  job: "Social media marketing"
  source: "https://zapier.com/automations/marketing/social-media-marketing/social-media-monitoring/notify-team-of-new-tagged-instagram-post-immediately-to-channel"
---

# Notify team of new tagged Instagram post immediately to channel

## What it does

1. **Trigger:** Instagram for Business fires on each new post that tags your account (New Tagged Media).
2. **Slack** posts one message to your team channel. It names the author (`@username`), includes the caption (cut to a set length), the link to the post, and a media preview. The message posts under a bot name and icon.

Nothing is filtered: every tagged post produces one message, and the message mentions nobody unless you turn mentions on.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Instagram for Business, New Tagged Media (`instagram-for-business`, `new_tag`). Set its Instagram account to the business account whose tags you want to watch. Its `authentication_id` is the user's Instagram connection.
2. **Connections** (each alias in the code is the app's slug):
   - `slack`: the user's Slack connection for the workspace where the channel lives.
3. **Constants:**
   - `SLACK_CHANNEL`: the channel ID to post into (not its name).
   - `BOT_NAME`, `BOT_ICON`: how the bot appears in the channel.
   - `MENTION_ENABLED`, `MENTION_TEXT`: leave `false` unless the team wants a group mention on every alert. `MENTION_TEXT` takes the Slack group markup for that group.
   - `MAX_CAPTION_LENGTH`: how much of the caption to keep.
4. Test with the steps below, then publish, wait until the trigger is active, and confirm the Instagram account is connected.

## Ask the user

- Which Instagram business account should be watched? The trigger needs its account ID, and the account must be an admin's Instagram Business account linked to a Facebook Page.
- Which Slack channel should receive the alerts? Use its channel ID.
- Should the bot have a different name or icon?
- Should every alert mention a coordinator role or channel group? If yes, which group?

## Test

Run this sample as a test run before publishing, with a sample that matches what the trigger returns:

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

Confirm that one message appears in the channel: the bot name and icon are set, the text names `@example_creator`, includes the caption and the permalink, and shows the picture as an attachment. Then delete the test message if it was not meant to stay.

## Customize

- **Filter for qualifying posts:** add a check before the Slack step so only posts with a minimum engagement or specific hashtags continue.
- **Mention a coordinator role or channel group** when higher-priority tags arrive: set `MENTION_ENABLED` to `true` and the group markup in `MENTION_TEXT`, or add a rule that picks the group by hashtag.

## Notes

- Instagram does not report whether a tagged post is public, so every tag alerts. Filter for that if the team only wants public posts.
- The trigger returns the username but not a display name, so the alert shows `@username`.
- A video's preview is its thumbnail; a photo's preview is the image itself.
- The Slack bot can post only in channels it has been added to. The message includes a link to the automation for editing unless the Slack action's "Include a link to this automation" option is turned off.
