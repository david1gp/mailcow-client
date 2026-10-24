import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { AppPasswordEditOptions } from "./appPasswordEditOptionsSchema.js"
import { appPasswordEditOptionsSchema } from "./appPasswordEditOptionsSchema.js"

/**
 * `POST /edit/app-passwd`. Raw JSON body is `{attr, items}`
 * (`json_api.php:1897-1899`). The handler reads `username` (target mailbox —
 * required: without it API-key callers edit as the pseudo-user "API"),
 * `app_name` (not `name`), plus `app_passwd`/`app_passwd2`, `active`,
 * `protocols` (`functions.app_passwd.inc.php:8-22,87-`).
 */
export async function appPasswordEdit(options: AppPasswordEditOptions): PromiseResult<string[]> {
  const op = "appPasswordEdit"
  const parsed = a.safeParse(appPasswordEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/app-passwd"),
    body: { attr: bodyOmitUndefined(attr), items },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
