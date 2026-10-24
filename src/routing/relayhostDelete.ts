import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { RelayhostDeleteOptions } from "./relayhostDeleteOptionsSchema.js"
import { relayhostDeleteOptionsSchema } from "./relayhostDeleteOptionsSchema.js"

/**
 * `POST /delete/relayhost`. Raw JSON body is the items array itself.
 */
export async function relayhostDelete(options: RelayhostDeleteOptions): PromiseResult<string[]> {
  const op = "relayhostDelete"
  const parsed = a.safeParse(relayhostDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/delete/relayhost"),
    body: items,
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
