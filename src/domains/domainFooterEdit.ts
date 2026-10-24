import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { DomainFooterEditOptions } from "./domainFooterEditOptionsSchema.js"
import { domainFooterEditOptionsSchema } from "./domainFooterEditOptionsSchema.js"

/** `POST /edit/domain/footer`. Raw JSON body is `{attr, items}`. */
export async function domainFooterEdit(options: DomainFooterEditOptions): PromiseResult<string[]> {
  const op = "domainFooterEdit"
  const parsed = a.safeParse(domainFooterEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/domain/footer"),
    body: { attr: bodyOmitUndefined(attr), items },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
