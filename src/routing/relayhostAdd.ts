import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { RelayhostAddOptions } from "./relayhostAddOptionsSchema.js"
import { relayhostAddOptionsSchema } from "./relayhostAddOptionsSchema.js"

/**
 * `POST /add/relayhost`. Raw JSON body is the attr object top-level.
 * The password travels in the request body but is never logged by this client.
 */
export async function relayhostAdd(options: RelayhostAddOptions): PromiseResult<string[]> {
  const op = "relayhostAdd"
  const parsed = a.safeParse(relayhostAddOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/add/relayhost"),
    body: bodyOmitUndefined(attr),
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
