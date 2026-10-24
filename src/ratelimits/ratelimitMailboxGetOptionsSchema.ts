import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const ratelimitMailboxGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  mailbox: a.string(),
})

export type RatelimitMailboxGetOptions = a.InferInput<typeof ratelimitMailboxGetOptionsSchema>
