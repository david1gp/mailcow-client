import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { TimeLimitedAliasEditOptions } from "./timeLimitedAliasEditOptionsSchema.js"
import { timeLimitedAliasEditOptionsSchema } from "./timeLimitedAliasEditOptionsSchema.js"

/**
 * `POST /edit/time_limited_alias` (`functions.mailbox.inc.php:2156-2290`).
 * Raw JSON body is `{attr, items}`.
 */
export async function timeLimitedAliasEdit(options: TimeLimitedAliasEditOptions): PromiseResult<string[]> {
  const op = "timeLimitedAliasEdit"
  const parsed = a.safeParse(timeLimitedAliasEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/time_limited_alias"),
    body: { attr: bodyOmitUndefined(attr), items },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
