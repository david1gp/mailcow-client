import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { GlobalFilterAddOptions } from "./globalFilterAddOptionsSchema.js"
import { globalFilterAddOptionsSchema } from "./globalFilterAddOptionsSchema.js"

/**
 * `POST /add/global-filter` (admin-only server-side). Writes the sieve
 * script to `/global_sieve/before|after` and restarts dovecot
 * (`functions.mailbox.inc.php:96-205`).
 */
export async function globalFilterAdd(options: GlobalFilterAddOptions): PromiseResult<string[]> {
  const op = "globalFilterAdd"
  const parsed = a.safeParse(globalFilterAddOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/add/global-filter"),
    body: bodyOmitUndefined(attr),
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
