import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const domainListOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  tags: a.optional(a.array(a.string())),
})

export type DomainListOptions = a.InferInput<typeof domainListOptionsSchema>
