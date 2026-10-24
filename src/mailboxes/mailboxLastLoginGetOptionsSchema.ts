import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const mailboxLastLoginGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  user: a.string(),
  days: a.optional(a.pipe(a.number(), a.integer(), a.minValue(1))),
})

export type MailboxLastLoginGetOptions = a.InferInput<typeof mailboxLastLoginGetOptionsSchema>
