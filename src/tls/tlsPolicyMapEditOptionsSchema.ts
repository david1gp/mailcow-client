import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const tlsPolicyMapEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
  attr: a.looseObject({
    dest: a.optional(a.string()),
    policy: a.optional(a.string()),
    parameters: a.optional(a.string()),
    active: a.optional(stringOrNumber),
  }),
})

export type TlsPolicyMapEditOptions = a.InferInput<typeof tlsPolicyMapEditOptionsSchema>
