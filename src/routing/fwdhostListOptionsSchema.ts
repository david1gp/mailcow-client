import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const fwdhostListOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type FwdhostListOptions = a.InferInput<typeof fwdhostListOptionsSchema>
