import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { TransportDeleteOptions } from "./transportDeleteOptionsSchema.js"
import { transportDeleteOptionsSchema } from "./transportDeleteOptionsSchema.js"

/**
 * `POST /delete/transport`. Raw JSON body is the items array itself.
 */
export async function transportDelete(options: TransportDeleteOptions): PromiseResult<string[]> {
  const op = "transportDelete"
  const parsed = a.safeParse(transportDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/delete/transport"),
    body: items,
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
