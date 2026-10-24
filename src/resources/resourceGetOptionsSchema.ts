import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const resourceGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  name: a.string(),
})

export type ResourceGetOptions = a.InferInput<typeof resourceGetOptionsSchema>
