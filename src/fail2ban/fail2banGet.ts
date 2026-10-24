import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { Fail2banDetails } from "./fail2banDetails.js"
import type { Fail2banGetOptions } from "./fail2banGetOptionsSchema.js"
import { fail2banGetOptionsSchema } from "./fail2banGetOptionsSchema.js"

/**
 * `GET /get/fail2ban`. The router ignores the object segment and returns
 * `fail2ban('get')` verbatim (`json_api.php:1277-1283`).
 */
export async function fail2banGet(options: Fail2banGetOptions): PromiseResult<Fail2banDetails> {
  const op = "fail2banGet"
  const parsed = a.safeParse(fail2banGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  return mailcowRequest<Fail2banDetails>({
    config,
    method: "GET",
    path: mailcowPathApi("/get/fail2ban"),
  })
}
