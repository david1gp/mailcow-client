import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const bccDestinationOptionsGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type BccDestinationOptionsGetOptions = a.InferInput<typeof bccDestinationOptionsGetOptionsSchema>
