import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const rspamdStatsGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type RspamdStatsGetOptions = a.InferInput<typeof rspamdStatsGetOptionsSchema>
