import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { DomainDeleteOptions } from "./domainDeleteOptionsSchema.js"
import { domainDeleteOptionsSchema } from "./domainDeleteOptionsSchema.js"

/**
 * `POST /delete/domain`. Raw JSON body is the items array itself
 * (`$_POST['items'] = $request`, `json_api.php:92`), NOT `{items}`.
 */
export async function domainDelete(options: DomainDeleteOptions): PromiseResult<string[]> {
  const op = "domainDelete"
  const parsed = a.safeParse(domainDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/delete/domain"),
    body: items,
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
