import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { StatusVersion } from "./statusVersion.js"
import type { StatusVersionGetOptions } from "./statusVersionGetOptionsSchema.js"
import { statusVersionGetOptionsSchema } from "./statusVersionGetOptionsSchema.js"

/**
 * `GET /get/status/version`. Admin-only in the router
 * (`json_api.php:1461`); API keys are admin-scoped.
 */
export async function statusVersionGet(options: StatusVersionGetOptions): PromiseResult<StatusVersion> {
  const op = "statusVersionGet"
  const parsed = a.safeParse(statusVersionGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  return mailcowRequest<StatusVersion>({
    config,
    method: "GET",
    path: mailcowPathApi("/get/status/version"),
  })
}
