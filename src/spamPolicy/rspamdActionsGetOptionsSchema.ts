import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const rspamdActionsGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type RspamdActionsGetOptions = a.InferInput<typeof rspamdActionsGetOptionsSchema>
