import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { QitemDeleteOptions } from "./qitemDeleteOptionsSchema.js"
import { qitemDeleteOptionsSchema } from "./qitemDeleteOptionsSchema.js"

/**
 * `POST /delete/qitem` (`quarantine('delete', ['id' => $items])`).
 * Items are quarantine ids. Raw JSON body is the items array itself.
 */
export async function qitemDelete(options: QitemDeleteOptions): PromiseResult<string[]> {
  const op = "qitemDelete"
  const parsed = a.safeParse(qitemDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/delete/qitem"),
    body: items,
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
