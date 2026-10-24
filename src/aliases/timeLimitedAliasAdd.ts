import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { TimeLimitedAliasAddOptions } from "./timeLimitedAliasAddOptionsSchema.js"
import { timeLimitedAliasAddOptionsSchema } from "./timeLimitedAliasAddOptionsSchema.js"

/** `POST /add/time_limited_alias`. Raw JSON body is the attr object top-level. */
export async function timeLimitedAliasAdd(options: TimeLimitedAliasAddOptions): PromiseResult<string[]> {
  const op = "timeLimitedAliasAdd"
  const parsed = a.safeParse(timeLimitedAliasAddOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/add/time_limited_alias"),
    body: bodyOmitUndefined(attr),
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
