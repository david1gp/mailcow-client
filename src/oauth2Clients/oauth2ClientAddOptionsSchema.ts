import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const oauth2ClientAddOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    redirect_uri: a.string(),
  }),
})

export type OAuth2ClientAddOptions = a.InferInput<typeof oauth2ClientAddOptionsSchema>
