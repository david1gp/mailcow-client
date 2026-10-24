import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { WebauthnTfaGetArgsGetOptions } from "./webauthnTfaGetArgsGetOptionsSchema.js"
import { webauthnTfaGetArgsGetOptionsSchema } from "./webauthnTfaGetArgsGetOptionsSchema.js"

/**
 * `GET /get/webauthn-tfa-get-args`. Returns WebAuthn `getGetArgs` JSON for
 * the pending-TFA login (`json_api.php:424-447`); without matching
 * credentials the router answers `{type: 'error', ...}` instead.
 * Live-corrected 2026-10-24: API-key callers get HTTP 200 with that
 * `{type: 'error'}` quirk object (no credentials match the pseudo-user) —
 * passed through as-is, not a client gap.
 */
export async function webauthnTfaGetArgsGet(
  options: WebauthnTfaGetArgsGetOptions,
): PromiseResult<Record<string, unknown>> {
  const op = "webauthnTfaGetArgsGet"
  const parsed = a.safeParse(webauthnTfaGetArgsGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  return mailcowRequest<Record<string, unknown>>({
    config,
    method: "GET",
    path: mailcowPathApi("/get/webauthn-tfa-get-args"),
  })
}
