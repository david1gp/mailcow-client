import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const oauth2ClientGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  id: a.union([a.string(), a.number()]),
})

export type OAuth2ClientGetOptions = a.InferInput<typeof oauth2ClientGetOptionsSchema>
