import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const relayhostListOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type RelayhostListOptions = a.InferInput<typeof relayhostListOptionsSchema>
