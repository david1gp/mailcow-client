import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"
import { logServiceSchema } from "./logServiceSchema.js"

export const logListOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  service: logServiceSchema,
  count: a.optional(a.number()),
})

export type LogListOptions = a.InferInput<typeof logListOptionsSchema>
