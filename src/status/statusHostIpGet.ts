import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { StatusHostIp } from "./statusHostIp.js"
import type { StatusHostIpGetOptions } from "./statusHostIpGetOptionsSchema.js"
import { statusHostIpGetOptionsSchema } from "./statusHostIpGetOptionsSchema.js"

/**
 * `GET /get/status/host/ip`. Admin-only in the router
 * (`json_api.php:1461`); API keys are admin-scoped. The server curls
 * `ipv4/ipv6.mailcow.email`, so this op is slow by nature.
 */
export async function statusHostIpGet(options: StatusHostIpGetOptions): PromiseResult<StatusHostIp> {
  const op = "statusHostIpGet"
  const parsed = a.safeParse(statusHostIpGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  return mailcowRequest<StatusHostIp>({
    config,
    method: "GET",
    path: mailcowPathApi("/get/status/host/ip"),
  })
}
