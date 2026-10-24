import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const domainTemplateDeleteOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
})

export type DomainTemplateDeleteOptions = a.InferInput<typeof domainTemplateDeleteOptionsSchema>
