import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { StatusHostGetOptions } from "./statusHostGetOptionsSchema.js"
import { statusHostGetOptionsSchema } from "./statusHostGetOptionsSchema.js"
import type { StatusHostStats } from "./statusHostStats.js"

/**
 * `GET /get/status/host`. Admin-only in the router
 * (`json_api.php:1461`); API keys are admin-scoped.
 */
export async function statusHostGet(options: StatusHostGetOptions): PromiseResult<StatusHostStats> {
  const op = "statusHostGet"
  const parsed = a.safeParse(statusHostGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  return mailcowRequest<StatusHostStats>({
    config,
    method: "GET",
    path: mailcowPathApi("/get/status/host"),
  })
}
