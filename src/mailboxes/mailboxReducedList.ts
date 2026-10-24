import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MailboxReducedDetails } from "./mailboxReducedDetails.js"
import type { MailboxReducedListOptions } from "./mailboxReducedListOptionsSchema.js"
import { mailboxReducedListOptionsSchema } from "./mailboxReducedListOptionsSchema.js"

/**
 * `GET /get/mailbox/reduced[/{domains}]` (`json_api.php:966-990`).
 * Empty lists echo `{}` — normalized to `[]`.
 */
export async function mailboxReducedList(options: MailboxReducedListOptions): PromiseResult<MailboxReducedDetails[]> {
  const op = "mailboxReducedList"
  const parsed = a.safeParse(mailboxReducedListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, domains } = parsed.output
  const scope = domains === undefined ? "" : `/${domains.map(encodeURIComponent).join(",")}`
  const requested = await mailcowRequest<unknown>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/mailbox/reduced${scope}`),
  })
  if (!requested.success) return requested
  return createResult(mailcowListNormalize<MailboxReducedDetails>(requested.data))
}
