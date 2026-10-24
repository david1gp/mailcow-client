import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const mailboxSpamScoreEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
  attr: a.looseObject({
    spam_score: a.optional(a.union([a.string(), a.number()])),
    tagged_mail_handler: a.optional(a.string()),
    spam_policy: a.optional(a.string()),
  }),
})

export type MailboxSpamScoreEditOptions = a.InferInput<typeof mailboxSpamScoreEditOptionsSchema>
