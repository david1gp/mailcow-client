import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const bccGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  id: a.union([a.string(), a.number()]),
})

export type BccGetOptions = a.InferInput<typeof bccGetOptionsSchema>
