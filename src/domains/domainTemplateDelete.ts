import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { DomainTemplateDeleteOptions } from "./domainTemplateDeleteOptionsSchema.js"
import { domainTemplateDeleteOptionsSchema } from "./domainTemplateDeleteOptionsSchema.js"

/** `POST /delete/domain/template`. Raw JSON body is the items array itself. */
export async function domainTemplateDelete(options: DomainTemplateDeleteOptions): PromiseResult<string[]> {
  const op = "domainTemplateDelete"
  const parsed = a.safeParse(domainTemplateDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/delete/domain/template"),
    body: items,
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
