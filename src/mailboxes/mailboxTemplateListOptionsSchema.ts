import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const mailboxTemplateListOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type MailboxTemplateListOptions = a.InferInput<typeof mailboxTemplateListOptionsSchema>
