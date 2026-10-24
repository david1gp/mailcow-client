import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { SyncJobEditOptions } from "./syncJobEditOptionsSchema.js"
import { syncJobEditOptionsSchema } from "./syncJobEditOptionsSchema.js"

/**
 * `POST /edit/syncjob`. Raw JSON body is `{attr, items}`
 * (`json_api.php:1970-1972`). `last_run`/`success` are presence flags:
 * passing them resets the stored values server-side
 * (`functions.mailbox.inc.php:2304-2306`).
 */
export async function syncJobEdit(options: SyncJobEditOptions): PromiseResult<string[]> {
  const op = "syncJobEdit"
  const parsed = a.safeParse(syncJobEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/syncjob"),
    body: { attr: bodyOmitUndefined(attr), items },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
