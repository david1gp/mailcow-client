import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { QuotaNotificationBccEditOptions } from "./quotaNotificationBccEditOptionsSchema.js"
import { quotaNotificationBccEditOptionsSchema } from "./quotaNotificationBccEditOptionsSchema.js"

/**
 * `POST /edit/quota_notification_bcc` (admin). Raw JSON body is `{attr}`
 * (`quota_notification_bcc('edit', $attr)`).
 */
export async function quotaNotificationBccEdit(options: QuotaNotificationBccEditOptions): PromiseResult<string[]> {
  const op = "quotaNotificationBccEdit"
  const parsed = a.safeParse(quotaNotificationBccEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/quota_notification_bcc"),
    body: { attr: bodyOmitUndefined(attr) },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
