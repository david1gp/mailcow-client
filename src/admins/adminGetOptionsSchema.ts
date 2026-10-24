import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const adminGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  username: a.string(),
})

export type AdminGetOptions = a.InferInput<typeof adminGetOptionsSchema>
