import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const fwdhostAddOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    hostname: a.string(),
    filter_spam: a.optional(stringOrNumber),
    keep_spam: a.optional(stringOrNumber),
  }),
})

export type FwdhostAddOptions = a.InferInput<typeof fwdhostAddOptionsSchema>
