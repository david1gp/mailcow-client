import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const resourceListOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type ResourceListOptions = a.InferInput<typeof resourceListOptionsSchema>
