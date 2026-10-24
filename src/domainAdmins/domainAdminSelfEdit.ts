import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { DomainAdminSelfEditOptions } from "./domainAdminSelfEditOptionsSchema.js"
import { domainAdminSelfEditOptionsSchema } from "./domainAdminSelfEditOptionsSchema.js"

/**
 * `POST /edit/self` as domainadmin. Session-only in practice: the router
 * branches on the session role and an API key always assumes `role=admin`
 * (`sessions.inc.php:61-62`), so this op only takes effect with a
 * domainadmin cookie session (`json_api.php:2044-2047`). Body is `{attr}`
 * with no items (`domain_admin('edit', $attr)`).
 */
export async function domainAdminSelfEdit(options: DomainAdminSelfEditOptions): PromiseResult<string[]> {
  const op = "domainAdminSelfEdit"
  const parsed = a.safeParse(domainAdminSelfEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/self"),
    body: { attr: bodyOmitUndefined(attr) },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
