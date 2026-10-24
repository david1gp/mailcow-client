import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const mailboxPolicyDeleteOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
})

export type MailboxPolicyDeleteOptions = a.InferInput<typeof mailboxPolicyDeleteOptionsSchema>
