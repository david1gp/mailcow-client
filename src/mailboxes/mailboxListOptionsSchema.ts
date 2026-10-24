import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const mailboxListOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  domains: a.optional(a.array(a.string())),
  tags: a.optional(a.array(a.string())),
})

export type MailboxListOptions = a.InferInput<typeof mailboxListOptionsSchema>
