import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { DkimDeleteOptions } from "./dkimDeleteOptionsSchema.js"
import { dkimDeleteOptionsSchema } from "./dkimDeleteOptionsSchema.js"

/**
 * `POST /delete/dkim` (`dkim('delete', ['domains' => $items])`).
 * Items are domain names. Raw JSON body is the items array itself.
 */
export async function dkimDelete(options: DkimDeleteOptions): PromiseResult<string[]> {
  const op = "dkimDelete"
  const parsed = a.safeParse(dkimDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/delete/dkim"),
    body: items,
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
