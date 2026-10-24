import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const adminListOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type AdminListOptions = a.InferInput<typeof adminListOptionsSchema>
