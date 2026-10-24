import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MtaStsAddOptions } from "./mtaStsAddOptionsSchema.js"
import { mtaStsAddOptionsSchema } from "./mtaStsAddOptionsSchema.js"

/**
 * `POST /add/mta-sts` (`mailbox('add', 'mta_sts', $attr)`).
 * Raw JSON body is the attr object top-level. There is no `GET /get/mta-sts`
 * route upstream — read MTA-STS back via mailbox details.
 */
export async function mtaStsAdd(options: MtaStsAddOptions): PromiseResult<string[]> {
  const op = "mtaStsAdd"
  const parsed = a.safeParse(mtaStsAddOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/add/mta-sts"),
    body: bodyOmitUndefined(attr),
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
