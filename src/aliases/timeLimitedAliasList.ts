import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { TimeLimitedAliasDetails } from "./timeLimitedAliasDetails.js"
import type { TimeLimitedAliasListOptions } from "./timeLimitedAliasListOptionsSchema.js"
import { timeLimitedAliasListOptionsSchema } from "./timeLimitedAliasListOptionsSchema.js"

/**
 * `GET /get/time_limited_aliases/{mailbox}` (`json_api.php:1269-1276`).
 * Empty lists echo `{}` — normalized to `[]`.
 */
export async function timeLimitedAliasList(
  options: TimeLimitedAliasListOptions,
): PromiseResult<TimeLimitedAliasDetails[]> {
  const op = "timeLimitedAliasList"
  const parsed = a.safeParse(timeLimitedAliasListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, mailbox } = parsed.output
  const requested = await mailcowRequest<unknown>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/time_limited_aliases/${encodeURIComponent(mailbox)}`),
  })
  if (!requested.success) return requested
  return createResult(mailcowListNormalize<TimeLimitedAliasDetails>(requested.data))
}
