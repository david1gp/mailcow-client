import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const mailboxCustomAttributeEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
  attr: a.looseObject({}),
})

export type MailboxCustomAttributeEditOptions = a.InferInput<typeof mailboxCustomAttributeEditOptionsSchema>
