import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MailboxSogoProfileDeleteOptions } from "./mailboxSogoProfileDeleteOptionsSchema.js"
import { mailboxSogoProfileDeleteOptionsSchema } from "./mailboxSogoProfileDeleteOptionsSchema.js"

/** `POST /delete/sogo_profile`: wipe SOGo profile for items = usernames. */
export async function mailboxSogoProfileDelete(options: MailboxSogoProfileDeleteOptions): PromiseResult<string[]> {
  const op = "mailboxSogoProfileDelete"
  const parsed = a.safeParse(mailboxSogoProfileDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/delete/sogo_profile"),
    body: items,
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
