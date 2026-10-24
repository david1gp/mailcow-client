import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { DkimDuplicateAddOptions } from "./dkimDuplicateAddOptionsSchema.js"
import { dkimDuplicateAddOptionsSchema } from "./dkimDuplicateAddOptionsSchema.js"

/**
 * `POST /add/dkim_duplicate` — copies the key from one domain to others
 * (`functions.dkim.inc.php:101-`). Raw JSON body is the attr object top-level.
 */
export async function dkimDuplicateAdd(options: DkimDuplicateAddOptions): PromiseResult<string[]> {
  const op = "dkimDuplicateAdd"
  const parsed = a.safeParse(dkimDuplicateAddOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/add/dkim_duplicate"),
    body: bodyOmitUndefined(attr),
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
