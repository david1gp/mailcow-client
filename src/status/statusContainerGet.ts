import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { StatusContainerGetOptions } from "./statusContainerGetOptionsSchema.js"
import { statusContainerGetOptionsSchema } from "./statusContainerGetOptionsSchema.js"
import type { StatusContainerStats } from "./statusContainerStats.js"

/**
 * `GET /get/status/container/{name}`. Admin-only in the router
 * (`json_api.php:1461`); API keys are admin-scoped.
 */
export async function statusContainerGet(options: StatusContainerGetOptions): PromiseResult<StatusContainerStats> {
  const op = "statusContainerGet"
  const parsed = a.safeParse(statusContainerGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, name } = parsed.output
  return mailcowRequest<StatusContainerStats>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/status/container/${encodeURIComponent(name)}`),
  })
}
