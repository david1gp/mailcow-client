import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const domainAdminSsoAddOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    username: a.string(),
  }),
})

export type DomainAdminSsoAddOptions = a.InferInput<typeof domainAdminSsoAddOptionsSchema>
