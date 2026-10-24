import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const tlsPolicyMapGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  id: a.union([a.string(), a.number()]),
})

export type TlsPolicyMapGetOptions = a.InferInput<typeof tlsPolicyMapGetOptionsSchema>
