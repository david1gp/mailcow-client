import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MailboxPushoverTestEditOptions } from "./mailboxPushoverTestEditOptionsSchema.js"
import { mailboxPushoverTestEditOptionsSchema } from "./mailboxPushoverTestEditOptionsSchema.js"

/** `POST /edit/pushover-test` (test push). Raw JSON body is `{attr, items}`. */
export async function mailboxPushoverTestEdit(options: MailboxPushoverTestEditOptions): PromiseResult<string[]> {
  const op = "mailboxPushoverTestEdit"
  const parsed = a.safeParse(mailboxPushoverTestEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/pushover-test"),
    body: { attr: bodyOmitUndefined(attr), items },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
