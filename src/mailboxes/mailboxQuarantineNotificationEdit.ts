import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MailboxQuarantineNotificationEditOptions } from "./mailboxQuarantineNotificationEditOptionsSchema.js"
import { mailboxQuarantineNotificationEditOptionsSchema } from "./mailboxQuarantineNotificationEditOptionsSchema.js"

/**
 * `POST /edit/quarantine_notification` (`functions.mailbox.inc.php:1963-`).
 * Raw JSON body is `{attr, items}`.
 */
export async function mailboxQuarantineNotificationEdit(
  options: MailboxQuarantineNotificationEditOptions,
): PromiseResult<string[]> {
  const op = "mailboxQuarantineNotificationEdit"
  const parsed = a.safeParse(mailboxQuarantineNotificationEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/quarantine_notification"),
    body: { attr: bodyOmitUndefined(attr), items },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
