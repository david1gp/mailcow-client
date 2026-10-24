import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const statusVersionGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type StatusVersionGetOptions = a.InferInput<typeof statusVersionGetOptionsSchema>
