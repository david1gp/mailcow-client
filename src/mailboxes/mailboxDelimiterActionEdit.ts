import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MailboxDelimiterActionEditOptions } from "./mailboxDelimiterActionEditOptionsSchema.js"
import { mailboxDelimiterActionEditOptionsSchema } from "./mailboxDelimiterActionEditOptionsSchema.js"

/**
 * `POST /edit/delimiter_action` (`functions.mailbox.inc.php:2209-`).
 * Raw JSON body is `{attr, items}`.
 */
export async function mailboxDelimiterActionEdit(options: MailboxDelimiterActionEditOptions): PromiseResult<string[]> {
  const op = "mailboxDelimiterActionEdit"
  const parsed = a.safeParse(mailboxDelimiterActionEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/delimiter_action"),
    body: { attr: bodyOmitUndefined(attr), items },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
