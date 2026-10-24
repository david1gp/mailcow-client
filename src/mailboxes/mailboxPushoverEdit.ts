import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MailboxPushoverEditOptions } from "./mailboxPushoverEditOptionsSchema.js"
import { mailboxPushoverEditOptionsSchema } from "./mailboxPushoverEditOptionsSchema.js"

/**
 * `POST /edit/pushover` (`functions.pushover.inc.php`).
 * Raw JSON body is `{attr, items}`.
 */
export async function mailboxPushoverEdit(options: MailboxPushoverEditOptions): PromiseResult<string[]> {
  const op = "mailboxPushoverEdit"
  const parsed = a.safeParse(mailboxPushoverEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/pushover"),
    body: { attr: bodyOmitUndefined(attr), items },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
