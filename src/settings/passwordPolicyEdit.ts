import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { PasswordPolicyEditOptions } from "./passwordPolicyEditOptionsSchema.js"
import { passwordPolicyEditOptionsSchema } from "./passwordPolicyEditOptionsSchema.js"

/**
 * `POST /edit/passwordpolicy` (admin). Raw JSON body is `{attr}`
 * (`password_complexity('edit', $attr)`, `functions.inc.php:161`).
 */
export async function passwordPolicyEdit(options: PasswordPolicyEditOptions): PromiseResult<string[]> {
  const op = "passwordPolicyEdit"
  const parsed = a.safeParse(passwordPolicyEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/passwordpolicy"),
    body: { attr: bodyOmitUndefined(attr) },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
