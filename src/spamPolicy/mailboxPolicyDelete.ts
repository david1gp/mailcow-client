import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MailboxPolicyDeleteOptions } from "./mailboxPolicyDeleteOptionsSchema.js"
import { mailboxPolicyDeleteOptionsSchema } from "./mailboxPolicyDeleteOptionsSchema.js"

/**
 * `POST /delete/mailbox-policy` (`policy('delete', 'mailbox', ['prefid' => $items])`).
 * Items are filterconf prefids. Raw JSON body is the items array itself.
 */
export async function mailboxPolicyDelete(options: MailboxPolicyDeleteOptions): PromiseResult<string[]> {
  const op = "mailboxPolicyDelete"
  const parsed = a.safeParse(mailboxPolicyDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/delete/mailbox-policy"),
    body: items,
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
