import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { DomainTemplate } from "./domainTemplate.js"
import type { DomainTemplateListOptions } from "./domainTemplateListOptionsSchema.js"
import { domainTemplateListOptionsSchema } from "./domainTemplateListOptionsSchema.js"

/** `GET /get/domain/template/all`. Empty lists echo `{}` — normalized to `[]`. */
export async function domainTemplateList(options: DomainTemplateListOptions): PromiseResult<DomainTemplate[]> {
  const op = "domainTemplateList"
  const parsed = a.safeParse(domainTemplateListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  const requested = await mailcowRequest<unknown>({
    config,
    method: "GET",
    path: mailcowPathApi("/get/domain/template/all"),
  })
  if (!requested.success) return requested
  return createResult(mailcowListNormalize<DomainTemplate>(requested.data))
}
