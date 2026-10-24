import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const mailboxPolicyBlListOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  mailbox: a.string(),
})

export type MailboxPolicyBlListOptions = a.InferInput<typeof mailboxPolicyBlListOptionsSchema>
