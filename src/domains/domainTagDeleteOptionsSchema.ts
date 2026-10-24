import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const domainTagDeleteOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  domain: a.string(),
  items: a.array(a.string()),
})

export type DomainTagDeleteOptions = a.InferInput<typeof domainTagDeleteOptionsSchema>
