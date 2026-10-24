import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { RsettingAddOptions } from "./rsettingAddOptionsSchema.js"
import { rsettingAddOptionsSchema } from "./rsettingAddOptionsSchema.js"

/**
 * `POST /add/rsetting` (`rsettings('add', $attr)`).
 * Raw JSON body is the attr object top-level.
 */
export async function rsettingAdd(options: RsettingAddOptions): PromiseResult<string[]> {
  const op = "rsettingAdd"
  const parsed = a.safeParse(rsettingAddOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/add/rsetting"),
    body: bodyOmitUndefined(attr),
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
