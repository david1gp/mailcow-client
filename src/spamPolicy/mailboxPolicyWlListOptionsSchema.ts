import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const mailboxPolicyWlListOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  mailbox: a.string(),
})

export type MailboxPolicyWlListOptions = a.InferInput<typeof mailboxPolicyWlListOptionsSchema>
