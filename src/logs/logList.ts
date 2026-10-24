import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { LogListOptions } from "./logListOptionsSchema.js"
import { logListOptionsSchema } from "./logListOptionsSchema.js"

/**
 * `GET /get/logs/{service}[/{count}]`. Empty services echo `'{}'`
 * (`json_api.php:805-962`), normalized to `[]`. Log lines may contain
 * sensitive content — this op passes them through without extra logging.
 */
export async function logList(options: LogListOptions): PromiseResult<string[]> {
  const op = "logList"
  const parsed = a.safeParse(logListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, service, count } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "GET",
    path: mailcowPathApi(count === undefined ? `/get/logs/${service}` : `/get/logs/${service}/${count}`),
  })
  if (!requested.success) return requested
  return createResult(mailcowListNormalize<string>(requested.data))
}
