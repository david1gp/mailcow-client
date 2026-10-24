import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const passwordPolicyEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    length: a.optional(stringOrNumber),
    chars: a.optional(stringOrNumber),
    lowerupper: a.optional(stringOrNumber),
    special_chars: a.optional(stringOrNumber),
    numbers: a.optional(stringOrNumber),
  }),
})

export type PasswordPolicyEditOptions = a.InferInput<typeof passwordPolicyEditOptionsSchema>
