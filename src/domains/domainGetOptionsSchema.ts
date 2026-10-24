import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const domainGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  domain: a.string(),
})

export type DomainGetOptions = a.InferInput<typeof domainGetOptionsSchema>
