import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MailboxDetails } from "./mailboxDetails.js"
import type { MailboxListOptions } from "./mailboxListOptionsSchema.js"
import { mailboxListOptionsSchema } from "./mailboxListOptionsSchema.js"

/**
 * `GET /get/mailbox/all[/{domains}][?tags=]`. Empty lists echo `{}` —
 * normalized to `[]`.
 */
export async function mailboxList(options: MailboxListOptions): PromiseResult<MailboxDetails[]> {
  const op = "mailboxList"
  const parsed = a.safeParse(mailboxListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, domains, tags } = parsed.output
  const scope = domains === undefined ? "" : `/${domains.map(encodeURIComponent).join(",")}`
  const requested = await mailcowRequest<unknown>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/mailbox/all${scope}`),
    query: { tags: tags === undefined ? undefined : tags.join(",") },
  })
  if (!requested.success) return requested
  return createResult(mailcowListNormalize<MailboxDetails>(requested.data))
}
