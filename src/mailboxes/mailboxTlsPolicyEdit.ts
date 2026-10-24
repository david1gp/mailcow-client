import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MailboxTlsPolicyEditOptions } from "./mailboxTlsPolicyEditOptionsSchema.js"
import { mailboxTlsPolicyEditOptionsSchema } from "./mailboxTlsPolicyEditOptionsSchema.js"

/**
 * `POST /edit/tls_policy` per mailbox (`functions.mailbox.inc.php:1909-`).
 * Raw JSON body is `{attr, items}`.
 */
export async function mailboxTlsPolicyEdit(options: MailboxTlsPolicyEditOptions): PromiseResult<string[]> {
  const op = "mailboxTlsPolicyEdit"
  const parsed = a.safeParse(mailboxTlsPolicyEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/tls_policy"),
    body: { attr: bodyOmitUndefined(attr), items },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
