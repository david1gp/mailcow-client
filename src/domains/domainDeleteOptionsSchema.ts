import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const domainDeleteOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
})

export type DomainDeleteOptions = a.InferInput<typeof domainDeleteOptionsSchema>
