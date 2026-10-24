import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const domainAdminEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
  attr: a.looseObject({
    active: a.optional(stringOrNumber),
    password: a.optional(a.string()),
    password2: a.optional(a.string()),
    domains: a.optional(a.array(a.string())),
    username_new: a.optional(a.string()),
    disable_tfa: a.optional(stringOrNumber),
    force_pw_update: a.optional(stringOrNumber),
    force_tfa: a.optional(stringOrNumber),
  }),
})

export type DomainAdminEditOptions = a.InferInput<typeof domainAdminEditOptionsSchema>
