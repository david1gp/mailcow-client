import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { AdminEditOptions } from "./adminEditOptionsSchema.js"
import { adminEditOptionsSchema } from "./adminEditOptionsSchema.js"

/**
 * `POST /edit/admin`. Raw JSON body is `{attr, items}`
 * (`json_api.php:2016-2018`). There is no self route for admins —
 * `edit/self` only branches domainadmin/user — so admins edit via this op.
 */
export async function adminEdit(options: AdminEditOptions): PromiseResult<string[]> {
  const op = "adminEdit"
  const parsed = a.safeParse(adminEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/admin"),
    body: { attr: bodyOmitUndefined(attr), items },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
