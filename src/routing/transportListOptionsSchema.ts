import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const transportListOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type TransportListOptions = a.InferInput<typeof transportListOptionsSchema>
