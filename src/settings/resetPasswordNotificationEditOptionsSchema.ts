import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const resetPasswordNotificationEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    sender: a.optional(a.string()),
    subject: a.optional(a.string()),
    html_tmpl: a.optional(a.string()),
  }),
})

export type ResetPasswordNotificationEditOptions = a.InferInput<typeof resetPasswordNotificationEditOptionsSchema>
