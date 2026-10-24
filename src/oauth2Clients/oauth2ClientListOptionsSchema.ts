import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const oauth2ClientListOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type OAuth2ClientListOptions = a.InferInput<typeof oauth2ClientListOptionsSchema>
