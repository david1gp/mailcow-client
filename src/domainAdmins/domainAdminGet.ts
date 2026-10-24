import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { DomainAdminDetails } from "./domainAdminDetails.js"
import type { DomainAdminGetOptions } from "./domainAdminGetOptionsSchema.js"
import { domainAdminGetOptionsSchema } from "./domainAdminGetOptionsSchema.js"

/** `GET /get/domain-admin/{username}`. */
export async function domainAdminGet(options: DomainAdminGetOptions): PromiseResult<DomainAdminDetails> {
  const op = "domainAdminGet"
  const parsed = a.safeParse(domainAdminGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, username } = parsed.output
  return mailcowRequest<DomainAdminDetails>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/domain-admin/${encodeURIComponent(username)}`),
  })
}
