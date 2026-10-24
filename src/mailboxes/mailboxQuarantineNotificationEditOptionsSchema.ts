import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const mailboxQuarantineNotificationEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
  attr: a.looseObject({
    quarantine_notification: a.optional(a.string()),
  }),
})

export type MailboxQuarantineNotificationEditOptions = a.InferInput<
  typeof mailboxQuarantineNotificationEditOptionsSchema
>
