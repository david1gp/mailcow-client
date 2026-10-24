import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const domainAddOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    domain: a.string(),
    description: a.optional(a.string()),
    aliases: a.optional(stringOrNumber),
    mailboxes: a.optional(stringOrNumber),
    defquota: a.optional(stringOrNumber),
    maxquota: a.optional(stringOrNumber),
    quota: a.optional(stringOrNumber),
    backupmx: a.optional(stringOrNumber),
    gal: a.optional(stringOrNumber),
    relay_all_recipients: a.optional(stringOrNumber),
    relay_unknown_only: a.optional(stringOrNumber),
    active: a.optional(stringOrNumber),
    tags: a.optional(a.array(a.string())),
    rl_value: a.optional(stringOrNumber),
    rl_frame: a.optional(a.string()),
    dkim_selector: a.optional(a.string()),
    key_size: a.optional(stringOrNumber),
    restart_sogo: a.optional(stringOrNumber),
  }),
})

export type DomainAddOptions = a.InferInput<typeof domainAddOptionsSchema>
