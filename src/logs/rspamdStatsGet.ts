import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { RspamdStats } from "./rspamdStats.js"
import type { RspamdStatsGetOptions } from "./rspamdStatsGetOptionsSchema.js"
import { rspamdStatsGetOptionsSchema } from "./rspamdStatsGetOptionsSchema.js"

/** `GET /get/logs/rspamd-stats`. Routed under logs, so this op lives here. */
export async function rspamdStatsGet(options: RspamdStatsGetOptions): PromiseResult<RspamdStats> {
  const op = "rspamdStatsGet"
  const parsed = a.safeParse(rspamdStatsGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  return mailcowRequest<RspamdStats>({
    config,
    method: "GET",
    path: mailcowPathApi("/get/logs/rspamd-stats"),
  })
}
