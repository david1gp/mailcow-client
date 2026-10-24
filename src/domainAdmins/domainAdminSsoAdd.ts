import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { DomainAdminSsoToken } from "./domainAdminSsoToken.js"
import type { DomainAdminSsoAddOptions } from "./domainAdminSsoAddOptionsSchema.js"
import { domainAdminSsoAddOptionsSchema } from "./domainAdminSsoAddOptionsSchema.js"

/**
 * `POST /add/sso/domain-admin`. Returns the bare token payload
 * (`{token}`, 30 s single-use), NOT an envelope (`json_api.php:304-314`),
 * so the response is typed as-is and never envelope-mapped.
 */
export async function domainAdminSsoAdd(options: DomainAdminSsoAddOptions): PromiseResult<DomainAdminSsoToken> {
  const op = "domainAdminSsoAdd"
  const parsed = a.safeParse(domainAdminSsoAddOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  return mailcowRequest<DomainAdminSsoToken>({
    config,
    method: "POST",
    path: mailcowPathApi("/add/sso/domain-admin"),
    body: bodyOmitUndefined(attr),
  })
}
