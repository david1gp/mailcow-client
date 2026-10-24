import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const statusHostGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type StatusHostGetOptions = a.InferInput<typeof statusHostGetOptionsSchema>
