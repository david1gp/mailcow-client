import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const tlsPolicyMapAddOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    dest: a.string(),
    policy: a.string(),
    parameters: a.optional(a.string()),
    active: a.optional(stringOrNumber),
  }),
})

export type TlsPolicyMapAddOptions = a.InferInput<typeof tlsPolicyMapAddOptionsSchema>
