import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const mailboxTemplateAddOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    template: a.string(),
    name: a.optional(a.string()),
    quota: a.optional(stringOrNumber),
    active: a.optional(stringOrNumber),
    sogo_access: a.optional(stringOrNumber),
    imap_access: a.optional(stringOrNumber),
    pop3_access: a.optional(stringOrNumber),
    smtp_access: a.optional(stringOrNumber),
    sieve_access: a.optional(stringOrNumber),
    eas_access: a.optional(stringOrNumber),
    dav_access: a.optional(stringOrNumber),
    relayhost: a.optional(stringOrNumber),
    quarantine_notification: a.optional(a.string()),
    quarantine_category: a.optional(a.string()),
    tags: a.optional(a.array(a.string())),
    protocol_access: a.optional(stringOrNumber),
    rl_value: a.optional(stringOrNumber),
    rl_frame: a.optional(a.string()),
    authsource: a.optional(a.string()),
  }),
})

export type MailboxTemplateAddOptions = a.InferInput<typeof mailboxTemplateAddOptionsSchema>
