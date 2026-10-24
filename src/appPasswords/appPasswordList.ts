import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { AppPasswordDetails } from "./appPasswordDetails.js"
import type { AppPasswordListOptions } from "./appPasswordListOptionsSchema.js"
import { appPasswordListOptionsSchema } from "./appPasswordListOptionsSchema.js"

/**
 * `GET /get/app-passwd/all[/{mailbox}]` (`json_api.php:529-560`).
 * Empty results echo `{}` — normalized to `[]`.
 */
export async function appPasswordList(options: AppPasswordListOptions): PromiseResult<AppPasswordDetails[]> {
  const op = "appPasswordList"
  const parsed = a.safeParse(appPasswordListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, mailbox } = parsed.output
  const requested = await mailcowRequest<unknown>({
    config,
    method: "GET",
    path: mailcowPathApi(
      mailbox === undefined ? "/get/app-passwd/all" : `/get/app-passwd/all/${encodeURIComponent(mailbox)}`,
    ),
  })
  if (!requested.success) return requested
  return createResult(mailcowListNormalize<AppPasswordDetails>(requested.data))
}
