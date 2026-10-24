import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const mailboxPushoverEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
  attr: a.looseObject({
    key: a.optional(a.string()),
    token: a.optional(a.string()),
    title: a.optional(a.string()),
    text: a.optional(a.string()),
    sound: a.optional(a.string()),
    senders: a.optional(a.string()),
    senders_regex: a.optional(a.string()),
    only_x_prio: a.optional(stringOrNumber),
    evaluate_x_prio: a.optional(stringOrNumber),
    active: a.optional(stringOrNumber),
  }),
})

export type MailboxPushoverEditOptions = a.InferInput<typeof mailboxPushoverEditOptionsSchema>
