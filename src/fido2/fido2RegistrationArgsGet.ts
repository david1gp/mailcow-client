import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { Fido2RegistrationArgsGetOptions } from "./fido2RegistrationArgsGetOptionsSchema.js"
import { fido2RegistrationArgsGetOptionsSchema } from "./fido2RegistrationArgsGetOptionsSchema.js"

/**
 * `GET /get/fido2-registration`. Returns WebAuthn `getCreateArgs` JSON plus
 * a server challenge stored in the session (`json_api.php:368-380`).
 * Live-corrected 2026-10-24: the args ARE issued to API-key callers (HTTP 200
 * with `publicKey`) — the router only needs `mailcow_cc_role`, which API-key
 * sessions have. Completing the ceremony still needs the session challenge,
 * so registration stays session-scoped in practice.
 */
export async function fido2RegistrationArgsGet(
  options: Fido2RegistrationArgsGetOptions,
): PromiseResult<Record<string, unknown>> {
  const op = "fido2RegistrationArgsGet"
  const parsed = a.safeParse(fido2RegistrationArgsGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  return mailcowRequest<Record<string, unknown>>({
    config,
    method: "GET",
    path: mailcowPathApi("/get/fido2-registration"),
  })
}
