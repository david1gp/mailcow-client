import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const domainFooterEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
  attr: a.looseObject({
    html: a.optional(a.string()),
    plain: a.optional(a.string()),
    mbox_exclude: a.optional(a.string()),
    alias_domain_exclude: a.optional(a.string()),
    skip_replies: a.optional(a.union([a.string(), a.number()])),
  }),
})

export type DomainFooterEditOptions = a.InferInput<typeof domainFooterEditOptionsSchema>
