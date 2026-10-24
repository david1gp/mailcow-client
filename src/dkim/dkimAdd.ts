import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { DkimAddOptions } from "./dkimAddOptionsSchema.js"
import { dkimAddOptionsSchema } from "./dkimAddOptionsSchema.js"

/**
 * `POST /add/dkim` — generates a key per domain into redis
 * (`functions.dkim.inc.php:2-`). Raw JSON body is the attr object top-level.
 * Note `domainAdd` already auto-provisions a default-selector key; adding
 * again for the same domain+selector hits the key-exists branch
 * (`dkim_domain_or_sel_invalid`).
 */
export async function dkimAdd(options: DkimAddOptions): PromiseResult<string[]> {
  const op = "dkimAdd"
  const parsed = a.safeParse(dkimAddOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/add/dkim"),
    body: bodyOmitUndefined(attr),
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
