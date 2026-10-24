import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { DomainDetails } from "./domainDetails.js"
import type { DomainListOptions } from "./domainListOptionsSchema.js"
import { domainListOptionsSchema } from "./domainListOptionsSchema.js"

/** `GET /get/domain/all[?tags=a,b]`. Empty lists echo `{}` — normalized to `[]`. */
export async function domainList(options: DomainListOptions): PromiseResult<DomainDetails[]> {
  const op = "domainList"
  const parsed = a.safeParse(domainListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, tags } = parsed.output
  const requested = await mailcowRequest<unknown>({
    config,
    method: "GET",
    path: mailcowPathApi("/get/domain/all"),
    query: { tags: tags === undefined ? undefined : tags.join(",") },
  })
  if (!requested.success) return requested
  return createResult(mailcowListNormalize<DomainDetails>(requested.data))
}
