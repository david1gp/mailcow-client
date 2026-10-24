import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const mailboxActiveUserSieveGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  mailbox: a.string(),
})

export type MailboxActiveUserSieveGetOptions = a.InferInput<typeof mailboxActiveUserSieveGetOptionsSchema>
