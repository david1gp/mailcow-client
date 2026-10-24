import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const timeLimitedAliasListOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  mailbox: a.string(),
})

export type TimeLimitedAliasListOptions = a.InferInput<typeof timeLimitedAliasListOptionsSchema>
