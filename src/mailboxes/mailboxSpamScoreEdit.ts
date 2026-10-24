import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MailboxSpamScoreEditOptions } from "./mailboxSpamScoreEditOptionsSchema.js"
import { mailboxSpamScoreEditOptionsSchema } from "./mailboxSpamScoreEditOptionsSchema.js"

/**
 * `POST /edit/spam-score` (`functions.mailbox.inc.php:2081-`).
 * Raw JSON body is `{attr, items}`.
 */
export async function mailboxSpamScoreEdit(options: MailboxSpamScoreEditOptions): PromiseResult<string[]> {
  const op = "mailboxSpamScoreEdit"
  const parsed = a.safeParse(mailboxSpamScoreEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/spam-score"),
    body: { attr: bodyOmitUndefined(attr), items },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
