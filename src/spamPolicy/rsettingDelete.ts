import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { RsettingDeleteOptions } from "./rsettingDeleteOptionsSchema.js"
import { rsettingDeleteOptionsSchema } from "./rsettingDeleteOptionsSchema.js"

/**
 * `POST /delete/rsetting` (`rsettings('delete', ['id' => $items])`).
 * Raw JSON body is the items array itself.
 */
export async function rsettingDelete(options: RsettingDeleteOptions): PromiseResult<string[]> {
  const op = "rsettingDelete"
  const parsed = a.safeParse(rsettingDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/delete/rsetting"),
    body: items,
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
