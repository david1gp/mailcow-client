import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const rsettingListOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type RsettingListOptions = a.InferInput<typeof rsettingListOptionsSchema>
