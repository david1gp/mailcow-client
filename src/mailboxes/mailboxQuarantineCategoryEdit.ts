import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MailboxQuarantineCategoryEditOptions } from "./mailboxQuarantineCategoryEditOptionsSchema.js"
import { mailboxQuarantineCategoryEditOptionsSchema } from "./mailboxQuarantineCategoryEditOptionsSchema.js"

/**
 * `POST /edit/quarantine_category` (`functions.mailbox.inc.php:2022-`).
 * Raw JSON body is `{attr, items}`.
 */
export async function mailboxQuarantineCategoryEdit(
  options: MailboxQuarantineCategoryEditOptions,
): PromiseResult<string[]> {
  const op = "mailboxQuarantineCategoryEdit"
  const parsed = a.safeParse(mailboxQuarantineCategoryEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/quarantine_category"),
    body: { attr: bodyOmitUndefined(attr), items },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
