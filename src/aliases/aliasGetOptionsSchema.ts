import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const aliasGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  address: a.string(),
})

export type AliasGetOptions = a.InferInput<typeof aliasGetOptionsSchema>
