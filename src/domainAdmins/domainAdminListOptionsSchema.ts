import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const domainAdminListOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type DomainAdminListOptions = a.InferInput<typeof domainAdminListOptionsSchema>
