import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const mailboxEasCacheDeleteOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
})

export type MailboxEasCacheDeleteOptions = a.InferInput<typeof mailboxEasCacheDeleteOptionsSchema>
