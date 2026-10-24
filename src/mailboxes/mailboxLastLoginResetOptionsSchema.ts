import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const mailboxLastLoginResetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  user: a.string(),
})

export type MailboxLastLoginResetOptions = a.InferInput<typeof mailboxLastLoginResetOptionsSchema>
