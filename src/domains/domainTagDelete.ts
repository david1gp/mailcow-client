import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { DomainTagDeleteOptions } from "./domainTagDeleteOptionsSchema.js"
import { domainTagDeleteOptionsSchema } from "./domainTagDeleteOptionsSchema.js"

/**
 * `POST /delete/domain/tag/{domain}` with items = tag names
 * (`json_api.php:1773-1774`). Raw JSON body is the items array itself.
 */
export async function domainTagDelete(options: DomainTagDeleteOptions): PromiseResult<string[]> {
  const op = "domainTagDelete"
  const parsed = a.safeParse(domainTagDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, domain, items } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi(`/delete/domain/tag/${encodeURIComponent(domain)}`),
    body: items,
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
