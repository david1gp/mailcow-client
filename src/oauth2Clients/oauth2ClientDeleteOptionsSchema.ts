import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const oauth2ClientDeleteOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
})

export type OAuth2ClientDeleteOptions = a.InferInput<typeof oauth2ClientDeleteOptionsSchema>
