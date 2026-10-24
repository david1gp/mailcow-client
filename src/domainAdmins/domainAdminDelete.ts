import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { DomainAdminDeleteOptions } from "./domainAdminDeleteOptionsSchema.js"
import { domainAdminDeleteOptionsSchema } from "./domainAdminDeleteOptionsSchema.js"

/**
 * `POST /delete/domain-admin`. Raw JSON body is the items array itself
 * (`$_POST['items'] = $request`, `json_api.php:92`), NOT `{items}`.
 */
export async function domainAdminDelete(options: DomainAdminDeleteOptions): PromiseResult<string[]> {
  const op = "domainAdminDelete"
  const parsed = a.safeParse(domainAdminDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/delete/domain-admin"),
    body: items,
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
