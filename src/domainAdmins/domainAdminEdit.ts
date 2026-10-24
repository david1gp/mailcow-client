import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { DomainAdminEditOptions } from "./domainAdminEditOptionsSchema.js"
import { domainAdminEditOptionsSchema } from "./domainAdminEditOptionsSchema.js"

/**
 * `POST /edit/domain-admin`. Raw JSON body is `{attr, items}`
 * (`json_api.php:2013-2015`).
 */
export async function domainAdminEdit(options: DomainAdminEditOptions): PromiseResult<string[]> {
  const op = "domainAdminEdit"
  const parsed = a.safeParse(domainAdminEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/domain-admin"),
    body: { attr: bodyOmitUndefined(attr), items },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
