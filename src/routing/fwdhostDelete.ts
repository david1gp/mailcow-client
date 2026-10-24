import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { FwdhostDeleteOptions } from "./fwdhostDeleteOptionsSchema.js"
import { fwdhostDeleteOptionsSchema } from "./fwdhostDeleteOptionsSchema.js"

/**
 * `POST /delete/fwdhost` (`fwdhost('delete', ['forwardinghost' => $items])`).
 * Items are forwarding hostnames. Raw JSON body is the items array itself.
 */
export async function fwdhostDelete(options: FwdhostDeleteOptions): PromiseResult<string[]> {
  const op = "fwdhostDelete"
  const parsed = a.safeParse(fwdhostDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/delete/fwdhost"),
    body: items,
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
