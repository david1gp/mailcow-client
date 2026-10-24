import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { TlsPolicyMapDetails } from "./tlsPolicyMapDetails.js"
import type { TlsPolicyMapGetOptions } from "./tlsPolicyMapGetOptionsSchema.js"
import { tlsPolicyMapGetOptionsSchema } from "./tlsPolicyMapGetOptionsSchema.js"

/**
 * `GET /get/tls-policy-map/{id}`.
 *
 * Known upstream quirk (faithfully passed through, `json_api.php:1228-1234`):
 * the detail branch appends an undefined `$details` element to the row, so the
 * response carries a trailing `null` entry. Prefer {@link tlsPolicyMapList}.
 */
export async function tlsPolicyMapGet(options: TlsPolicyMapGetOptions): PromiseResult<TlsPolicyMapDetails> {
  const op = "tlsPolicyMapGet"
  const parsed = a.safeParse(tlsPolicyMapGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, id } = parsed.output
  return mailcowRequest<TlsPolicyMapDetails>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/tls-policy-map/${encodeURIComponent(String(id))}`),
  })
}
