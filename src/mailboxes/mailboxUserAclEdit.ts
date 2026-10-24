import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MailboxUserAclEditOptions } from "./mailboxUserAclEditOptionsSchema.js"
import { mailboxUserAclEditOptionsSchema } from "./mailboxUserAclEditOptionsSchema.js"

/**
 * `POST /edit/user-acl`: items = usernames, attr `user_acl` map
 * (`spam_alias`, `syncjobs`, `filters`, `pushover`, `quarantine`, ...;
 * `functions.acl.inc.php`).
 */
export async function mailboxUserAclEdit(options: MailboxUserAclEditOptions): PromiseResult<string[]> {
  const op = "mailboxUserAclEdit"
  const parsed = a.safeParse(mailboxUserAclEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/user-acl"),
    body: { attr: bodyOmitUndefined(attr), items },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
