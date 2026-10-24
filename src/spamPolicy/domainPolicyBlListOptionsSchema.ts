import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const domainPolicyBlListOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  domain: a.string(),
})

export type DomainPolicyBlListOptions = a.InferInput<typeof domainPolicyBlListOptionsSchema>
