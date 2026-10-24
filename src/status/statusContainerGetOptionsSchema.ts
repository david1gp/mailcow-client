import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const statusContainerGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  name: a.string(),
})

export type StatusContainerGetOptions = a.InferInput<typeof statusContainerGetOptionsSchema>
