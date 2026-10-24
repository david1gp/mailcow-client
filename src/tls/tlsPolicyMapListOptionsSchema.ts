import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const tlsPolicyMapListOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type TlsPolicyMapListOptions = a.InferInput<typeof tlsPolicyMapListOptionsSchema>
