import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { AliasDomainDeleteOptions } from "./aliasDomainDeleteOptionsSchema.js"
import { aliasDomainDeleteOptionsSchema } from "./aliasDomainDeleteOptionsSchema.js"

/** `POST /delete/alias-domain`. Raw JSON body is the items array itself. */
export async function aliasDomainDelete(options: AliasDomainDeleteOptions): PromiseResult<string[]> {
  const op = "aliasDomainDelete"
  const parsed = a.safeParse(aliasDomainDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/delete/alias-domain"),
    body: items,
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
