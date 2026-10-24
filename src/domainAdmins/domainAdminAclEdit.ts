import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { DomainAdminAclEditOptions } from "./domainAdminAclEditOptionsSchema.js"
import { domainAdminAclEditOptionsSchema } from "./domainAdminAclEditOptionsSchema.js"

/**
 * `POST /edit/da-acl`. Raw JSON body is `{attr, items}` with
 * items = `[username]` (`json_api.php:2004-2006`).
 */
export async function domainAdminAclEdit(options: DomainAdminAclEditOptions): PromiseResult<string[]> {
  const op = "domainAdminAclEdit"
  const parsed = a.safeParse(domainAdminAclEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/da-acl"),
    body: { attr, items },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
