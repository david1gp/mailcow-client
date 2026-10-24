import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MailboxCustomAttributeEditOptions } from "./mailboxCustomAttributeEditOptionsSchema.js"
import { mailboxCustomAttributeEditOptionsSchema } from "./mailboxCustomAttributeEditOptionsSchema.js"

/**
 * `POST /edit/mailbox/custom-attribute` with custom key/values as attr
 * (`functions.mailbox.inc.php:3920-`). Raw JSON body is `{attr, items}`.
 */
export async function mailboxCustomAttributeEdit(options: MailboxCustomAttributeEditOptions): PromiseResult<string[]> {
  const op = "mailboxCustomAttributeEdit"
  const parsed = a.safeParse(mailboxCustomAttributeEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/mailbox/custom-attribute"),
    body: { attr: bodyOmitUndefined(attr), items },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
