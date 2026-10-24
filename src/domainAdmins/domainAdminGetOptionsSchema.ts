import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const domainAdminGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  username: a.string(),
})

export type DomainAdminGetOptions = a.InferInput<typeof domainAdminGetOptionsSchema>
