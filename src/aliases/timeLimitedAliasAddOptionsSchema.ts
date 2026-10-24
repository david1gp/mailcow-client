import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const timeLimitedAliasAddOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    username: a.string(),
    domain: a.string(),
    validity: a.optional(a.union([a.string(), a.number()])),
    permanent: a.optional(a.union([a.string(), a.number(), a.boolean()])),
    description: a.optional(a.string()),
  }),
})

export type TimeLimitedAliasAddOptions = a.InferInput<typeof timeLimitedAliasAddOptionsSchema>
