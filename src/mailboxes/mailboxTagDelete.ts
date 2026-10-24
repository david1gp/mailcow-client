import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MailboxTagDeleteOptions } from "./mailboxTagDeleteOptionsSchema.js"
import { mailboxTagDeleteOptionsSchema } from "./mailboxTagDeleteOptionsSchema.js"

/**
 * `POST /delete/mailbox/tag/{mailbox}` with items = tag names
 * (`json_api.php:1788-1789`). Raw JSON body is the items array itself.
 */
export async function mailboxTagDelete(options: MailboxTagDeleteOptions): PromiseResult<string[]> {
  const op = "mailboxTagDelete"
  const parsed = a.safeParse(mailboxTagDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, mailbox, items } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi(`/delete/mailbox/tag/${encodeURIComponent(mailbox)}`),
    body: items,
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
