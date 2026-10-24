import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const mailboxSpamScoreGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  mailbox: a.string(),
})

export type MailboxSpamScoreGetOptions = a.InferInput<typeof mailboxSpamScoreGetOptionsSchema>
