import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const filterListOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  mailbox: a.optional(a.string()),
})

export type FilterListOptions = a.InferInput<typeof filterListOptionsSchema>
