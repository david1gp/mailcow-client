import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const mailboxPushoverTestEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
  attr: a.looseObject({
    title: a.optional(a.string()),
    text: a.optional(a.string()),
  }),
})

export type MailboxPushoverTestEditOptions = a.InferInput<typeof mailboxPushoverTestEditOptionsSchema>
