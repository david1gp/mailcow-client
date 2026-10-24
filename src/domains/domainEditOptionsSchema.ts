import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const domainEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
  attr: a.looseObject({
    description: a.optional(a.string()),
    aliases: a.optional(stringOrNumber),
    mailboxes: a.optional(stringOrNumber),
    quota: a.optional(stringOrNumber),
    maxquota: a.optional(stringOrNumber),
    defquota: a.optional(stringOrNumber),
    active: a.optional(stringOrNumber),
    backupmx: a.optional(stringOrNumber),
    gal: a.optional(stringOrNumber),
    relay_all_recipients: a.optional(stringOrNumber),
    relay_unknown_only: a.optional(stringOrNumber),
    tags: a.optional(a.array(a.string())),
    relayhost: a.optional(a.string()),
  }),
})

export type DomainEditOptions = a.InferInput<typeof domainEditOptionsSchema>
