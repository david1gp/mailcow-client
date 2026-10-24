import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { Fail2banBanlistEditOptions } from "./fail2banBanlistEditOptionsSchema.js"
import { fail2banBanlistEditOptionsSchema } from "./fail2banBanlistEditOptionsSchema.js"

/**
 * `POST /edit/fail2ban/banlist`. Items carry the banlist id; the router
 * refreshes it (`fail2ban('banlist', 'refresh', $items)`,
 * `json_api.php:2022-2029`). The body takes no attr.
 */
export async function fail2banBanlistEdit(options: Fail2banBanlistEditOptions): PromiseResult<string[]> {
  const op = "fail2banBanlistEdit"
  const parsed = a.safeParse(fail2banBanlistEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/fail2ban/banlist"),
    body: { items },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
