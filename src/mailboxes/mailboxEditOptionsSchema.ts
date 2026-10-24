import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const mailboxEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
  attr: a.looseObject({
    name: a.optional(a.string()),
    password: a.optional(a.string()),
    password2: a.optional(a.string()),
    quota: a.optional(stringOrNumber),
    active: a.optional(stringOrNumber),
    force_pw_update: a.optional(stringOrNumber),
    force_tfa: a.optional(stringOrNumber),
    sogo_access: a.optional(stringOrNumber),
    imap_access: a.optional(stringOrNumber),
    pop3_access: a.optional(stringOrNumber),
    smtp_access: a.optional(stringOrNumber),
    sieve_access: a.optional(stringOrNumber),
    eas_access: a.optional(stringOrNumber),
    dav_access: a.optional(stringOrNumber),
    relayhost: a.optional(stringOrNumber),
    tags: a.optional(a.array(a.string())),
    sender_acl: a.optional(a.array(a.string())),
    extended_sender_acl: a.optional(stringOrNumber),
    authsource: a.optional(a.string()),
    pw_recovery_email: a.optional(a.string()),
    attribute_hash: a.optional(a.string()),
    protocol_access: a.optional(stringOrNumber),
  }),
})

export type MailboxEditOptions = a.InferInput<typeof mailboxEditOptionsSchema>
