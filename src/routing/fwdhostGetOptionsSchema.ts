import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const fwdhostGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  hostname: a.string(),
})

export type FwdhostGetOptions = a.InferInput<typeof fwdhostGetOptionsSchema>
