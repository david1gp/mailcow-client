import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const tlsPolicyMapDeleteOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
})

export type TlsPolicyMapDeleteOptions = a.InferInput<typeof tlsPolicyMapDeleteOptionsSchema>
