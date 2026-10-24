import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { IdentityProviderDeleteOptions } from "./identityProviderDeleteOptionsSchema.js"
import { identityProviderDeleteOptionsSchema } from "./identityProviderDeleteOptionsSchema.js"

/**
 * `POST /delete/identity-provider` (admin). NOT in the inventory (§22 lists
 * only the edit/test/get routes) but routed in the source
 * (`identity_provider('delete')`, `json_api.php:1825-1826`). The handler
 * takes no arguments; the `{}` body only satisfies the router's JSON-body
 * requirement for non-get actions.
 */
export async function identityProviderDelete(options: IdentityProviderDeleteOptions): PromiseResult<string[]> {
  const op = "identityProviderDelete"
  const parsed = a.safeParse(identityProviderDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/delete/identity-provider"),
    body: {},
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
