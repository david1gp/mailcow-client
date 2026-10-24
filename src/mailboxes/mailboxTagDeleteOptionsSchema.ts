import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const mailboxTagDeleteOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  mailbox: a.string(),
  items: a.array(a.string()),
})

export type MailboxTagDeleteOptions = a.InferInput<typeof mailboxTagDeleteOptionsSchema>
