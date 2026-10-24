import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const mailboxUserAclEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
  attr: a.looseObject({
    user_acl: a.optional(a.record(a.string(), a.unknown())),
  }),
})

export type MailboxUserAclEditOptions = a.InferInput<typeof mailboxUserAclEditOptionsSchema>
