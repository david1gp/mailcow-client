import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const timeLimitedAliasDeleteOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
})

export type TimeLimitedAliasDeleteOptions = a.InferInput<typeof timeLimitedAliasDeleteOptionsSchema>
