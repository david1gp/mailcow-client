import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const recipientMapListOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type RecipientMapListOptions = a.InferInput<typeof recipientMapListOptionsSchema>
