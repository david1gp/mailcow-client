import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MailboxRenameOptions } from "./mailboxRenameOptionsSchema.js"
import { mailboxRenameOptionsSchema } from "./mailboxRenameOptionsSchema.js"

/**
 * `POST /edit/rename-mbox`: attr requires `old_local_part` (+`new_local_part`,
 * `domain`, `create_alias`; `functions.mailbox.inc.php:3537-3600`). Items are
 * the old mailbox address for scoping only — the handler ignores them.
 */
export async function mailboxRename(options: MailboxRenameOptions): PromiseResult<string[]> {
  const op = "mailboxRename"
  const parsed = a.safeParse(mailboxRenameOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/rename-mbox"),
    body: { attr: bodyOmitUndefined(attr), items },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
