import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const mailboxTemplateDeleteOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
})

export type MailboxTemplateDeleteOptions = a.InferInput<typeof mailboxTemplateDeleteOptionsSchema>
