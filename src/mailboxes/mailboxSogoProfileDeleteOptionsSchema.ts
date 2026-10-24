import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const mailboxSogoProfileDeleteOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
})

export type MailboxSogoProfileDeleteOptions = a.InferInput<typeof mailboxSogoProfileDeleteOptionsSchema>
