import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const sievePresetListOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type SievePresetListOptions = a.InferInput<typeof sievePresetListOptionsSchema>
