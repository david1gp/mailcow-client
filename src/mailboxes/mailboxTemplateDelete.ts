import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MailboxTemplateDeleteOptions } from "./mailboxTemplateDeleteOptionsSchema.js"
import { mailboxTemplateDeleteOptionsSchema } from "./mailboxTemplateDeleteOptionsSchema.js"

/** `POST /delete/mailbox/template`. Raw JSON body is the items array itself. */
export async function mailboxTemplateDelete(options: MailboxTemplateDeleteOptions): PromiseResult<string[]> {
  const op = "mailboxTemplateDelete"
  const parsed = a.safeParse(mailboxTemplateDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/delete/mailbox/template"),
    body: items,
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
