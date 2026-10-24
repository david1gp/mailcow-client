import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { WebauthnTfaRegistrationArgsGetOptions } from "./webauthnTfaRegistrationArgsGetOptionsSchema.js"
import { webauthnTfaRegistrationArgsGetOptionsSchema } from "./webauthnTfaRegistrationArgsGetOptionsSchema.js"

/**
 * `GET /get/webauthn-tfa-registration`. Returns WebAuthn `getCreateArgs` JSON
 * for TFA registration (`json_api.php:397-423`). Live-corrected 2026-10-24:
 * the args ARE issued to API-key callers (HTTP 200 with `publicKey`).
 * Completing the registration still needs a session, so it stays
 * session-scoped in practice.
 */
export async function webauthnTfaRegistrationArgsGet(
  options: WebauthnTfaRegistrationArgsGetOptions,
): PromiseResult<Record<string, unknown>> {
  const op = "webauthnTfaRegistrationArgsGet"
  const parsed = a.safeParse(webauthnTfaRegistrationArgsGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  return mailcowRequest<Record<string, unknown>>({
    config,
    method: "GET",
    path: mailcowPathApi("/get/webauthn-tfa-registration"),
  })
}
