import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Render service endpoint that accepts a JSON render request (POST).
const RENDER_REQUEST_URL = "YOUR_RENDER_REQUEST_URL";
// Render status endpoint (GET); "{id}" is replaced with the render ID the POST returned.
const RENDER_STATUS_URL = "YOUR_RENDER_STATUS_URL/{id}";
// Field in the POST response that holds the render ID (dot path for nested fields).
const RENDER_ID_FIELD = "id";
// Field in the status response that holds the render status.
const STATUS_FIELD = "status";
// Field in the status response that holds the finished MP4's download URL.
const DOWNLOAD_URL_FIELD = "download_url";
// Status values (lowercase) that mean the render finished.
const DONE_STATUSES = ["done", "completed", "succeeded", "success", "ready"];
// Status values (lowercase) that mean the render failed and polling should stop.
const FAILED_STATUSES = ["failed", "error", "cancelled", "canceled"];
// Avatar sent with every render request.
const DEFAULT_AVATAR = "default";
// Voice sent with every render request.
const DEFAULT_VOICE = "default";
// Aspect ratio sent with every render request.
const DEFAULT_ASPECT_RATIO = "16:9";
// Seconds to wait before the first status check.
const INITIAL_DELAY_SECONDS = 30;
// Seconds to wait between status checks.
const POLL_INTERVAL_SECONDS = 30;
// Status checks before giving up (with the delays above: about 5 minutes).
const MAX_POLL_ATTEMPTS = 10;
// Google Drive folder ID of the shared library that receives finished MP4s.
const LIBRARY_FOLDER_ID = "YOUR_LIBRARY_FOLDER_ID";
// MIME type prefixes that count as media uploads; other new files are skipped.
const MEDIA_MIME_PREFIXES = ["video/", "audio/", "image/"];

const InputSchema = z
  .object({
    id: z.string(),
    title: z.string().nullable().optional(),
    originalFilename: z.string().nullable().optional(),
    mimeType: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    alternateLink: z.string().nullable().optional(),
    webContentLink: z.string().nullable().optional(),
    createdDate: z.string().nullable().optional(),
    lastModifyingUserName: z.string().nullable().optional(),
  })
  .loose();

function normalizeInput(rawInput: unknown): unknown {
  if (typeof rawInput === "string") {
    return JSON.parse(rawInput);
  }
  return rawInput;
}

function readPath(value: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object") {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, value);
}

function stripExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

const workflow = defineDurable<unknown, unknown>(
  "create-final-video-from-new-uploads-into-shared-library",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(normalizeInput(rawInput));

    const mimeType = input.mimeType ?? "";
    if (!MEDIA_MIME_PREFIXES.some((prefix) => mimeType.startsWith(prefix))) {
      return {
        skipped: true,
        reason: "not-a-media-file",
        fileId: input.id,
        mimeType,
      };
    }

    const sourceName = input.title ?? input.originalFilename ?? input.id;
    const title = stripExtension(sourceName);
    const finalName = `${title}.mp4`;

    const existing = await ctx.step("find-existing-render", async () =>
      sdk.runAction({
        appKey: "google-drive",
        actionType: "search",
        actionKey: "file_v2",
        connection: "google-drive",
        inputs: {
          title: finalName,
          folder: LIBRARY_FOLDER_ID,
          search_type: "exact",
        },
      }),
    );
    const match = existing.data?.[0] as
      { id?: string; alternateLink?: string } | undefined;
    if (match?.id) {
      return {
        skipped: true,
        reason: "already-in-library",
        title,
        libraryFileId: match.id,
        libraryFileLink: match.alternateLink ?? null,
      };
    }

    const renderRequest = {
      source_file_id: input.id,
      source_url: input.webContentLink ?? input.alternateLink ?? "",
      source_filename: sourceName,
      title,
      script: input.description ?? "",
      avatar: DEFAULT_AVATAR,
      voice: DEFAULT_VOICE,
      aspect_ratio: DEFAULT_ASPECT_RATIO,
      uploaded_by: input.lastModifyingUserName ?? "",
      uploaded_at: input.createdDate ?? "",
    };

    const submitted = await ctx.step("request-render", async () =>
      sdk.runAction({
        appKey: "webhook",
        actionType: "write",
        actionKey: "post",
        inputs: {
          url: RENDER_REQUEST_URL,
          payload_type: "json",
          data: renderRequest,
          unflatten: "no",
          extract_variables: "no",
        },
      }),
    );
    const renderIdValue = readPath(submitted.data?.[0], RENDER_ID_FIELD);
    if (
      renderIdValue === undefined ||
      renderIdValue === null ||
      renderIdValue === ""
    ) {
      throw new Error(
        `Render service response has no "${RENDER_ID_FIELD}" field`,
      );
    }
    const renderId = String(renderIdValue);
    const statusUrl = RENDER_STATUS_URL.replace(
      "{id}",
      encodeURIComponent(renderId),
    );

    await ctx.wait("wait-for-render-start", INITIAL_DELAY_SECONDS);

    let downloadUrl: string | null = null;
    let lastStatus = "unknown";
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
      if (attempt > 0) {
        await ctx.wait(`wait-before-poll-${attempt}`, POLL_INTERVAL_SECONDS);
      }
      const poll = await ctx.step(
        `check-render-status-${attempt}`,
        async () => {
          const result = await sdk.runAction({
            appKey: "webhook",
            actionType: "write",
            actionKey: "get",
            inputs: {
              url: statusUrl,
              data: { render_id: renderId },
              unflatten: "no",
            },
          });
          const body = result.data?.[0];
          const status = readPath(body, STATUS_FIELD);
          const url = readPath(body, DOWNLOAD_URL_FIELD);
          return {
            status:
              typeof status === "string"
                ? status.toLowerCase()
                : String(status ?? "unknown"),
            downloadUrl: typeof url === "string" && url ? url : null,
          };
        },
      );
      lastStatus = poll.status;
      if (FAILED_STATUSES.includes(poll.status)) {
        return {
          failed: true,
          reason: "render-failed",
          renderId,
          status: poll.status,
          title,
        };
      }
      if (DONE_STATUSES.includes(poll.status) && poll.downloadUrl) {
        downloadUrl = poll.downloadUrl;
        break;
      }
    }

    if (!downloadUrl) {
      return {
        failed: true,
        reason: "render-timed-out",
        renderId,
        lastStatus,
        attempts: MAX_POLL_ATTEMPTS,
        title,
      };
    }

    const saved = await ctx.step("save-final-video", async () =>
      sdk.runAction({
        appKey: "google-drive",
        actionType: "write",
        actionKey: "file",
        connection: "google-drive",
        inputs: {
          file: downloadUrl,
          folder: LIBRARY_FOLDER_ID,
          new_name: title,
          new_extension: "mp4",
        },
      }),
    );
    const file = saved.data?.[0] as
      { id?: string; title?: string; alternateLink?: string } | undefined;

    return {
      renderId,
      title,
      libraryFileId: file?.id ?? null,
      libraryFileName: file?.title ?? finalName,
      libraryFileLink: file?.alternateLink ?? null,
    };
  },
);

export default workflow;
