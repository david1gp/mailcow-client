import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const quotaNotificationBccEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    bcc_rcpt: a.optional(a.string()),
  }),
})

export type QuotaNotificationBccEditOptions = a.InferInput<typeof quotaNotificationBccEditOptionsSchema>
