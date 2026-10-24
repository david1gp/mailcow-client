import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { FilterListOptions } from "./filterListOptionsSchema.js"
import { filterListOptionsSchema } from "./filterListOptionsSchema.js"
import type { SieveFilterDetails } from "./sieveFilterDetails.js"

/**
 * `GET /get/filters/all` (no mailbox) or `GET /get/filters/{mailbox}`
 * (`json_api.php:1116-1155`). One op with an optional mailbox, matching the
 * Batch A `mailboxGet` precedent. Empty results echo `{}` — normalized to `[]`.
 */
export async function filterList(options: FilterListOptions): PromiseResult<SieveFilterDetails[]> {
  const op = "filterList"
  const parsed = a.safeParse(filterListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, mailbox } = parsed.output
  const requested = await mailcowRequest<unknown>({
    config,
    method: "GET",
    path: mailcowPathApi(mailbox === undefined ? "/get/filters/all" : `/get/filters/${encodeURIComponent(mailbox)}`),
  })
  if (!requested.success) return requested
  return createResult(mailcowListNormalize<SieveFilterDetails>(requested.data))
}
