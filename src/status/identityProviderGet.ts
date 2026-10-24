import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { IdentityProviderGetOptions } from "./identityProviderGetOptionsSchema.js"
import { identityProviderGetOptionsSchema } from "./identityProviderGetOptionsSchema.js"
import type { IdentityProviderSettings } from "./identityProviderSettings.js"

/**
 * `GET /get/identity-provider`. Admin-only in the router
 * (`json_api.php:1535-1541`); API keys are admin-scoped. Placed under
 * `status` because the inventory (§21) lists it with the status reads, not
 * with the branding/settings edits. Returns `null` when no IdP is configured.
 */
export async function identityProviderGet(
  options: IdentityProviderGetOptions,
): PromiseResult<IdentityProviderSettings | null> {
  const op = "identityProviderGet"
  const parsed = a.safeParse(identityProviderGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  return mailcowRequest<IdentityProviderSettings | null>({
    config,
    method: "GET",
    path: mailcowPathApi("/get/identity-provider"),
  })
}
