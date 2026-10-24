import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { DomainAdminDetails } from "./domainAdminDetails.js"
import type { DomainAdminListOptions } from "./domainAdminListOptionsSchema.js"
import { domainAdminListOptionsSchema } from "./domainAdminListOptionsSchema.js"

/** `GET /get/domain-admin/all`. Empty lists echo `{}` — normalized to `[]`. */
export async function domainAdminList(options: DomainAdminListOptions): PromiseResult<DomainAdminDetails[]> {
  const op = "domainAdminList"
  const parsed = a.safeParse(domainAdminListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  const requested = await mailcowRequest<unknown>({
    config,
    method: "GET",
    path: mailcowPathApi("/get/domain-admin/all"),
  })
  if (!requested.success) return requested
  return createResult(mailcowListNormalize<DomainAdminDetails>(requested.data))
}
