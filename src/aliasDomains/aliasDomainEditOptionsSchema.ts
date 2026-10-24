import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const aliasDomainEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
  attr: a.looseObject({
    target_domain: a.optional(a.string()),
    active: a.optional(a.union([a.string(), a.number()])),
  }),
})

export type AliasDomainEditOptions = a.InferInput<typeof aliasDomainEditOptionsSchema>
