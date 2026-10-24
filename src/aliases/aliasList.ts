import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { AliasDetails } from "./aliasDetails.js"
import type { AliasListOptions } from "./aliasListOptionsSchema.js"
import { aliasListOptionsSchema } from "./aliasListOptionsSchema.js"

/**
 * `GET /get/alias/all[/{domains}]` (`json_api.php:1357-1391`).
 * Empty lists echo `{}` — normalized to `[]`.
 */
export async function aliasList(options: AliasListOptions): PromiseResult<AliasDetails[]> {
  const op = "aliasList"
  const parsed = a.safeParse(aliasListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, domains } = parsed.output
  const scope = domains === undefined ? "" : `/${domains.map(encodeURIComponent).join(",")}`
  const requested = await mailcowRequest<unknown>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/alias/all${scope}`),
  })
  if (!requested.success) return requested
  return createResult(mailcowListNormalize<AliasDetails>(requested.data))
}
