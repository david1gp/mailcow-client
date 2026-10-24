import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const domainPolicyWlListOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  domain: a.string(),
})

export type DomainPolicyWlListOptions = a.InferInput<typeof domainPolicyWlListOptionsSchema>
