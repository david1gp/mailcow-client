import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { TransportAddOptions } from "./transportAddOptionsSchema.js"
import { transportAddOptionsSchema } from "./transportAddOptionsSchema.js"

/**
 * `POST /add/transport`. Raw JSON body is the attr object top-level.
 * The password travels in the request body but is never logged by this client.
 */
export async function transportAdd(options: TransportAddOptions): PromiseResult<string[]> {
  const op = "transportAdd"
  const parsed = a.safeParse(transportAddOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/add/transport"),
    body: bodyOmitUndefined(attr),
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
