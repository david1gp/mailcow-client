import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { QuotaNotificationEditOptions } from "./quotaNotificationEditOptionsSchema.js"
import { quotaNotificationEditOptionsSchema } from "./quotaNotificationEditOptionsSchema.js"

/**
 * `POST /edit/quota_notification` (admin). Raw JSON body is `{attr}`
 * (`quota_notification('edit', $attr)`).
 */
export async function quotaNotificationEdit(options: QuotaNotificationEditOptions): PromiseResult<string[]> {
  const op = "quotaNotificationEdit"
  const parsed = a.safeParse(quotaNotificationEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/quota_notification"),
    body: { attr: bodyOmitUndefined(attr) },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
