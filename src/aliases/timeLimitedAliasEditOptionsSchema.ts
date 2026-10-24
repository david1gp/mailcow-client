import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const timeLimitedAliasEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
  attr: a.looseObject({
    validity: a.optional(a.union([a.string(), a.number()])),
    permanent: a.optional(a.union([a.string(), a.number(), a.boolean()])),
    tagged_mail_handler: a.optional(a.string()),
  }),
})

export type TimeLimitedAliasEditOptions = a.InferInput<typeof timeLimitedAliasEditOptionsSchema>
