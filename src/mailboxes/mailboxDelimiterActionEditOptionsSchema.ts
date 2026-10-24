import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const mailboxDelimiterActionEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
  attr: a.looseObject({
    tagged_mail_handler: a.optional(a.string()),
  }),
})

export type MailboxDelimiterActionEditOptions = a.InferInput<typeof mailboxDelimiterActionEditOptionsSchema>
