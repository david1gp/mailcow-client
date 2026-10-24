import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { RatelimitHashDeleteOptions } from "./ratelimitHashDeleteOptionsSchema.js"
import { ratelimitHashDeleteOptionsSchema } from "./ratelimitHashDeleteOptionsSchema.js"

/**
 * `POST /delete/rlhash`. The router echoes `ratelimit('delete', ...)`'s
 * boolean return raw (`"1"`/`""`, `json_api.php:1822-1824`) — never an
 * envelope — so the body is returned as text, unmapped. The router implodes
 * the items array into a single `RL…` hash server-side
 * (`functions.ratelimit.inc.php:194`).
 */
export async function ratelimitHashDelete(options: RatelimitHashDeleteOptions): PromiseResult<string> {
  const op = "ratelimitHashDelete"
  const parsed = a.safeParse(ratelimitHashDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items } = parsed.output
  return mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/delete/rlhash"),
    body: items,
    responseType: "text",
  })
}
