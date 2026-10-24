import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { SyncJobDetails } from "./syncJobDetails.js"
import type { SyncJobGetOptions } from "./syncJobGetOptionsSchema.js"
import { syncJobGetOptionsSchema } from "./syncJobGetOptionsSchema.js"

/**
 * `GET /get/syncjobs/{mailbox}[/{fields}]` (`json_api.php:1082-1103`).
 * `fields` is a CSV column subset; `with_password` includes the cleartext
 * password field in the response type. Password values are typed but never
 * logged or printed by this client.
 */
export async function syncJobGet(options: SyncJobGetOptions): PromiseResult<SyncJobDetails[]> {
  const op = "syncJobGet"
  const parsed = a.safeParse(syncJobGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, mailbox, fields } = parsed.output
  const suffix =
    fields === undefined || fields.length === 0 ? "" : `/${fields.map((field) => encodeURIComponent(field)).join(",")}`
  const requested = await mailcowRequest<unknown>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/syncjobs/${encodeURIComponent(mailbox)}${suffix}`),
  })
  if (!requested.success) return requested
  return createResult(mailcowListNormalize<SyncJobDetails>(requested.data))
}
