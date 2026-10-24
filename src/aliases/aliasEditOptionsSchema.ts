import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const aliasEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
  attr: a.looseObject({
    address: a.optional(a.string()),
    goto: a.optional(a.string()),
    active: a.optional(stringOrNumber),
    goto_spam: a.optional(stringOrNumber),
    goto_ham: a.optional(stringOrNumber),
    goto_null: a.optional(stringOrNumber),
    sogo_visible: a.optional(stringOrNumber),
    private_comment: a.optional(a.string()),
    public_comment: a.optional(a.string()),
  }),
})

export type AliasEditOptions = a.InferInput<typeof aliasEditOptionsSchema>
