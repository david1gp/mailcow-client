import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { IdentityProviderEditOptions } from "./identityProviderEditOptionsSchema.js"
import { identityProviderEditOptionsSchema } from "./identityProviderEditOptionsSchema.js"

/**
 * `POST /edit/identity-provider` (admin). Raw JSON body is `{attr}`
 * (`identity_provider('edit', $attr)`). Carries `bindpass`/`client_secret`
 * credential fields — typed normally, never logged.
 */
export async function identityProviderEdit(options: IdentityProviderEditOptions): PromiseResult<string[]> {
  const op = "identityProviderEdit"
  const parsed = a.safeParse(identityProviderEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/identity-provider"),
    body: { attr: bodyOmitUndefined(attr) },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
