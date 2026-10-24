import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { CorsEditOptions } from "./corsEditOptionsSchema.js"
import { corsEditOptionsSchema } from "./corsEditOptionsSchema.js"

/**
 * `POST /edit/cors` (admin). Raw JSON body is `{attr}`
 * (`cors('edit', $attr)`). Note the router has a duplicate `case "cors"`
 * in the edit switch (`json_api.php:2052-2063`) — the second case is
 * unreachable, both call the same handler, so behavior is unaffected.
 */
export async function corsEdit(options: CorsEditOptions): PromiseResult<string[]> {
  const op = "corsEdit"
  const parsed = a.safeParse(corsEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/cors"),
    body: { attr: bodyOmitUndefined(attr) },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
