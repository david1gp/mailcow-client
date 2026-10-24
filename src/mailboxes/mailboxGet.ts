import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MailboxDetails } from "./mailboxDetails.js"
import type { MailboxGetOptions } from "./mailboxGetOptionsSchema.js"
import { mailboxGetOptionsSchema } from "./mailboxGetOptionsSchema.js"

/**
 * `GET /get/mailbox/{id}`. With `?tags=` the id is a domain and a filtered
 * per-domain listing returns instead (`json_api.php:1001-1019`); both shapes
 * normalize through the list helper only in the tags branch.
 */
export async function mailboxGet(options: MailboxGetOptions): PromiseResult<MailboxDetails | MailboxDetails[]> {
  const op = "mailboxGet"
  const parsed = a.safeParse(mailboxGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, mailbox, tags } = parsed.output
  const requested = await mailcowRequest<unknown>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/mailbox/${encodeURIComponent(mailbox)}`),
    query: { tags: tags === undefined ? undefined : tags.join(",") },
  })
  if (!requested.success) return requested
  if (tags === undefined) return createResult(requested.data as MailboxDetails)
  return createResult(mailcowListNormalize<MailboxDetails>(requested.data))
}
