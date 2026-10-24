import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MailboxTemplateEditOptions } from "./mailboxTemplateEditOptionsSchema.js"
import { mailboxTemplateEditOptionsSchema } from "./mailboxTemplateEditOptionsSchema.js"

/** `POST /edit/mailbox/template`. Raw JSON body is `{attr, items}`. */
export async function mailboxTemplateEdit(options: MailboxTemplateEditOptions): PromiseResult<string[]> {
  const op = "mailboxTemplateEdit"
  const parsed = a.safeParse(mailboxTemplateEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/mailbox/template"),
    body: { attr: bodyOmitUndefined(attr), items },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
