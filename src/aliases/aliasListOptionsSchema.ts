import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const aliasListOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  domains: a.optional(a.array(a.string())),
})

export type AliasListOptions = a.InferInput<typeof aliasListOptionsSchema>
