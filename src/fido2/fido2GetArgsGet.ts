import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { Fido2GetArgsGetOptions } from "./fido2GetArgsGetOptionsSchema.js"
import { fido2GetArgsGetOptionsSchema } from "./fido2GetArgsGetOptionsSchema.js"

/**
 * `GET /get/fido2-get-args`. Returns WebAuthn `getGetArgs` JSON for login
 * without a username (`json_api.php:382-395`). Live-corrected 2026-10-24:
 * the args ARE issued to API-key callers (HTTP 200 with `publicKey`).
 * Verifying a ceremony still needs the session challenge, so login stays
 * session-scoped in practice.
 */
export async function fido2GetArgsGet(options: Fido2GetArgsGetOptions): PromiseResult<Record<string, unknown>> {
  const op = "fido2GetArgsGet"
  const parsed = a.safeParse(fido2GetArgsGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  return mailcowRequest<Record<string, unknown>>({
    config,
    method: "GET",
    path: mailcowPathApi("/get/fido2-get-args"),
  })
}
