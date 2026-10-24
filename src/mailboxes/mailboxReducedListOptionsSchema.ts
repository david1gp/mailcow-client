import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const mailboxReducedListOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  domains: a.optional(a.array(a.string())),
})

export type MailboxReducedListOptions = a.InferInput<typeof mailboxReducedListOptionsSchema>
