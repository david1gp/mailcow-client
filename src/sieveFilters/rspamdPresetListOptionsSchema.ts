import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const rspamdPresetListOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type RspamdPresetListOptions = a.InferInput<typeof rspamdPresetListOptionsSchema>
