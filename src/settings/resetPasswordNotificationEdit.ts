import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { ResetPasswordNotificationEditOptions } from "./resetPasswordNotificationEditOptionsSchema.js"
import { resetPasswordNotificationEditOptionsSchema } from "./resetPasswordNotificationEditOptionsSchema.js"

/**
 * `POST /edit/reset-password-notification` (admin). Raw JSON body is `{attr}`
 * (`reset_password('edit_notification', $attr)`).
 */
export async function resetPasswordNotificationEdit(
  options: ResetPasswordNotificationEditOptions,
): PromiseResult<string[]> {
  const op = "resetPasswordNotificationEdit"
  const parsed = a.safeParse(resetPasswordNotificationEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/reset-password-notification"),
    body: { attr: bodyOmitUndefined(attr) },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
