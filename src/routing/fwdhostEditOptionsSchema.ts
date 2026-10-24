import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const fwdhostEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.string()),
  attr: a.looseObject({
    hostname: a.optional(a.string()),
    filter_spam: a.optional(stringOrNumber),
    keep_spam: a.optional(stringOrNumber),
  }),
})

export type FwdhostEditOptions = a.InferInput<typeof fwdhostEditOptionsSchema>
