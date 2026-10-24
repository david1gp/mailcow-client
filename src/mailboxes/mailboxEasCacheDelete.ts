import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MailboxEasCacheDeleteOptions } from "./mailboxEasCacheDeleteOptionsSchema.js"
import { mailboxEasCacheDeleteOptionsSchema } from "./mailboxEasCacheDeleteOptionsSchema.js"

/** `POST /delete/eas_cache`: purge SOGo EAS cache for items = usernames. */
export async function mailboxEasCacheDelete(options: MailboxEasCacheDeleteOptions): PromiseResult<string[]> {
  const op = "mailboxEasCacheDelete"
  const parsed = a.safeParse(mailboxEasCacheDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/delete/eas_cache"),
    body: items,
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
