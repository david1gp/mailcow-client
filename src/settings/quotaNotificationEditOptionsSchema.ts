import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const quotaNotificationEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    sender: a.optional(a.string()),
    subject: a.optional(a.string()),
    html_tmpl: a.optional(a.string()),
    active: a.optional(stringOrNumber),
  }),
})

export type QuotaNotificationEditOptions = a.InferInput<typeof quotaNotificationEditOptionsSchema>
