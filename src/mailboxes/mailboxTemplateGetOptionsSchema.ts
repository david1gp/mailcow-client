import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const mailboxTemplateGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  id: a.union([a.string(), a.number()]),
})

export type MailboxTemplateGetOptions = a.InferInput<typeof mailboxTemplateGetOptionsSchema>
