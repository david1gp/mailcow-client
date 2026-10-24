import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { DomainTemplateAddOptions } from "./domainTemplateAddOptionsSchema.js"
import { domainTemplateAddOptionsSchema } from "./domainTemplateAddOptionsSchema.js"

/** `POST /add/domain/template`. Raw JSON body is the attr object top-level. */
export async function domainTemplateAdd(options: DomainTemplateAddOptions): PromiseResult<string[]> {
  const op = "domainTemplateAdd"
  const parsed = a.safeParse(domainTemplateAddOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/add/domain/template"),
    body: bodyOmitUndefined(attr),
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
