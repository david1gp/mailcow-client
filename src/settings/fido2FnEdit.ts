import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { Fido2FnEditOptions } from "./fido2FnEditOptionsSchema.js"
import { fido2FnEditOptionsSchema } from "./fido2FnEditOptionsSchema.js"

/**
 * `POST /edit/fido2-fn` for the session user (friendly-name edit,
 * `fido2('edit_fn', ...)`). Live-corrected 2026-10-24: API-key callers get
 * HTTP 200 success — but it acts on the session user (`API`), matches zero
 * credential rows, and is a no-op (`functions.inc.php:1554-1578` pushes
 * success unconditionally). Only a cookie session edits real names.
 */
export async function fido2FnEdit(options: Fido2FnEditOptions): PromiseResult<string[]> {
  const op = "fido2FnEdit"
  const parsed = a.safeParse(fido2FnEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/fido2-fn"),
    body: { attr: bodyOmitUndefined(attr) },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
