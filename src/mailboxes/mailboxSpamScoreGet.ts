import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MailboxSpamScore } from "./mailboxSpamScore.js"
import type { MailboxSpamScoreGetOptions } from "./mailboxSpamScoreGetOptionsSchema.js"
import { mailboxSpamScoreGetOptionsSchema } from "./mailboxSpamScoreGetOptionsSchema.js"

/** `GET /get/spam-score/{mailbox}`. Empty echoes `{}` (returned as-is). */
export async function mailboxSpamScoreGet(options: MailboxSpamScoreGetOptions): PromiseResult<MailboxSpamScore> {
  const op = "mailboxSpamScoreGet"
  const parsed = a.safeParse(mailboxSpamScoreGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, mailbox } = parsed.output
  return mailcowRequest<MailboxSpamScore>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/spam-score/${encodeURIComponent(mailbox)}`),
  })
}
