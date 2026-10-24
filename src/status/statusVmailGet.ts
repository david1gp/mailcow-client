import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { StatusVmailGetOptions } from "./statusVmailGetOptionsSchema.js"
import { statusVmailGetOptionsSchema } from "./statusVmailGetOptionsSchema.js"
import type { StatusVmailDetails } from "./statusVmailDetails.js"

/**
 * `GET /get/status/vmail`. Admin-only in the router
 * (`json_api.php:1461`); API keys are admin-scoped.
 */
export async function statusVmailGet(options: StatusVmailGetOptions): PromiseResult<StatusVmailDetails> {
  const op = "statusVmailGet"
  const parsed = a.safeParse(statusVmailGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  return mailcowRequest<StatusVmailDetails>({
    config,
    method: "GET",
    path: mailcowPathApi("/get/status/vmail"),
  })
}
