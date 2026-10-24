import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MailboxTemplateAddOptions } from "./mailboxTemplateAddOptionsSchema.js"
import { mailboxTemplateAddOptionsSchema } from "./mailboxTemplateAddOptionsSchema.js"

/** `POST /add/mailbox/template`. Raw JSON body is the attr object top-level. */
export async function mailboxTemplateAdd(options: MailboxTemplateAddOptions): PromiseResult<string[]> {
  const op = "mailboxTemplateAdd"
  const parsed = a.safeParse(mailboxTemplateAddOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/add/mailbox/template"),
    body: bodyOmitUndefined(attr),
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
