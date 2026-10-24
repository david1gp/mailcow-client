import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { SyncJobAddOptions } from "./syncJobAddOptionsSchema.js"
import { syncJobAddOptionsSchema } from "./syncJobAddOptionsSchema.js"

/**
 * `POST /add/syncjob`. Raw JSON body is the attr object top-level
 * (`$_POST['attr'] = $request`, `json_api.php:80-83`). `exclude` has no
 * upstream default and its column is `NOT NULL`, so omitted `exclude`,
 * `subfolder2`, and `custom_params` are sent as `""` (live pin: the e2e
 * passes all three as empty strings).
 */
export async function syncJobAdd(options: SyncJobAddOptions): PromiseResult<string[]> {
  const op = "syncJobAdd"
  const parsed = a.safeParse(syncJobAddOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/add/syncjob"),
    body: bodyOmitUndefined({ exclude: "", subfolder2: "", custom_params: "", ...attr }),
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
