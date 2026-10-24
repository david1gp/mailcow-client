import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const transportGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  id: a.union([a.string(), a.number()]),
})

export type TransportGetOptions = a.InferInput<typeof transportGetOptionsSchema>
