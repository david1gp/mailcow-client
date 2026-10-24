import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const domainTemplateListOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type DomainTemplateListOptions = a.InferInput<typeof domainTemplateListOptionsSchema>
