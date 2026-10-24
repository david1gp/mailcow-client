import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const mailboxGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  mailbox: a.string(),
  tags: a.optional(a.array(a.string())),
})

export type MailboxGetOptions = a.InferInput<typeof mailboxGetOptionsSchema>
