import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { DomainTemplate } from "./domainTemplate.js"
import type { DomainTemplateGetOptions } from "./domainTemplateGetOptionsSchema.js"
import { domainTemplateGetOptionsSchema } from "./domainTemplateGetOptionsSchema.js"

/** `GET /get/domain/template/{id}`. Empty echoes `{}` (returned as-is). */
export async function domainTemplateGet(options: DomainTemplateGetOptions): PromiseResult<DomainTemplate> {
  const op = "domainTemplateGet"
  const parsed = a.safeParse(domainTemplateGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, id } = parsed.output
  return mailcowRequest<DomainTemplate>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/domain/template/${encodeURIComponent(String(id))}`),
  })
}
