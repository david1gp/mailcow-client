import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { RspamdActionsGetOptions } from "./rspamdActionsGetOptionsSchema.js"
import { rspamdActionsGetOptionsSchema } from "./rspamdActionsGetOptionsSchema.js"

/**
 * `GET /get/rspamd/actions`. The router echoes `json_encode($data)` directly
 * (not via `process_get_return`, `json_api.php:451-460`): an array of
 * `[action, count]` pairs, or `'{}'` when rspamd is unreachable — normalized
 * to `[]` here.
 */
export async function rspamdActionsGet(options: RspamdActionsGetOptions): PromiseResult<Array<[string, number]>> {
  const op = "rspamdActionsGet"
  const parsed = a.safeParse(rspamdActionsGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  const requested = await mailcowRequest<unknown>({
    config,
    method: "GET",
    path: mailcowPathApi("/get/rspamd/actions"),
  })
  if (!requested.success) return requested
  if (!Array.isArray(requested.data)) return createResult([])
  return createResult(requested.data as Array<[string, number]>)
}
