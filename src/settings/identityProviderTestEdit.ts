import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { IdentityProviderTestEditOptions } from "./identityProviderTestEditOptionsSchema.js"
import { identityProviderTestEditOptionsSchema } from "./identityProviderTestEditOptionsSchema.js"

/**
 * `POST /edit/identity-provider-test` (admin). The router passes attr
 * straight through (`identity_provider('test', $attr)`); raw JSON body is
 * `{attr}`. Connection-test params ride in attr.
 */
export async function identityProviderTestEdit(options: IdentityProviderTestEditOptions): PromiseResult<string[]> {
  const op = "identityProviderTestEdit"
  const parsed = a.safeParse(identityProviderTestEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/identity-provider-test"),
    body: { attr: bodyOmitUndefined(attr) },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
