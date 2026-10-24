import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const aliasDomainAddOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    alias_domain: a.string(),
    target_domain: a.string(),
    active: a.optional(stringOrNumber),
    rl_value: a.optional(stringOrNumber),
    rl_frame: a.optional(a.string()),
    key_size: a.optional(stringOrNumber),
    dkim_selector: a.optional(a.string()),
  }),
})

export type AliasDomainAddOptions = a.InferInput<typeof aliasDomainAddOptionsSchema>
