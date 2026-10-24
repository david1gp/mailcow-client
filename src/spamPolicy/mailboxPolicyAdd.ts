import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MailboxPolicyAddOptions } from "./mailboxPolicyAddOptionsSchema.js"
import { mailboxPolicyAddOptionsSchema } from "./mailboxPolicyAddOptionsSchema.js"

/**
 * `POST /add/mailbox-policy` (`policy('add', 'mailbox', $attr)`).
 * Raw JSON body is the attr object top-level.
 */
export async function mailboxPolicyAdd(options: MailboxPolicyAddOptions): PromiseResult<string[]> {
  const op = "mailboxPolicyAdd"
  const parsed = a.safeParse(mailboxPolicyAddOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/add/mailbox-policy"),
    body: bodyOmitUndefined(attr),
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
