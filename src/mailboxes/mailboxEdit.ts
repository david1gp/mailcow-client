import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MailboxEditOptions } from "./mailboxEditOptionsSchema.js"
import { mailboxEditOptionsSchema } from "./mailboxEditOptionsSchema.js"

/**
 * `POST /edit/mailbox` (`functions.mailbox.inc.php:3148-3800`).
 * Raw JSON body is `{attr, items}`.
 */
export async function mailboxEdit(options: MailboxEditOptions): PromiseResult<string[]> {
  const op = "mailboxEdit"
  const parsed = a.safeParse(mailboxEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/mailbox"),
    body: { attr: bodyOmitUndefined(attr), items },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
