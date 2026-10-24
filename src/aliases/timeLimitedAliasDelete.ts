import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { TimeLimitedAliasDeleteOptions } from "./timeLimitedAliasDeleteOptionsSchema.js"
import { timeLimitedAliasDeleteOptionsSchema } from "./timeLimitedAliasDeleteOptionsSchema.js"

/** `POST /delete/time_limited_alias`. Raw JSON body is the items array itself. */
export async function timeLimitedAliasDelete(options: TimeLimitedAliasDeleteOptions): PromiseResult<string[]> {
  const op = "timeLimitedAliasDelete"
  const parsed = a.safeParse(timeLimitedAliasDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/delete/time_limited_alias"),
    body: items,
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
