import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const fwdhostDeleteOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.string()),
})

export type FwdhostDeleteOptions = a.InferInput<typeof fwdhostDeleteOptionsSchema>
