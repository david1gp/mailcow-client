import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const mailboxQuarantineCategoryEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
  attr: a.looseObject({
    quarantine_category: a.optional(a.string()),
  }),
})

export type MailboxQuarantineCategoryEditOptions = a.InferInput<typeof mailboxQuarantineCategoryEditOptionsSchema>
