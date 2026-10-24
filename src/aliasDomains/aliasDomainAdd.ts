import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { AliasDomainAddOptions } from "./aliasDomainAddOptionsSchema.js"
import { aliasDomainAddOptionsSchema } from "./aliasDomainAddOptionsSchema.js"

/** `POST /add/alias-domain`. Raw JSON body is the attr object top-level. */
export async function aliasDomainAdd(options: AliasDomainAddOptions): PromiseResult<string[]> {
  const op = "aliasDomainAdd"
  const parsed = a.safeParse(aliasDomainAddOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/add/alias-domain"),
    body: bodyOmitUndefined(attr),
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
