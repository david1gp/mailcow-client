import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const bccListOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type BccListOptions = a.InferInput<typeof bccListOptionsSchema>
