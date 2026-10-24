import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const appPasswordListOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  mailbox: a.optional(a.string()),
})

export type AppPasswordListOptions = a.InferInput<typeof appPasswordListOptionsSchema>
