import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const mailboxTlsPolicyEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
  attr: a.looseObject({
    tls_policy: a.optional(a.string()),
  }),
})

export type MailboxTlsPolicyEditOptions = a.InferInput<typeof mailboxTlsPolicyEditOptionsSchema>
