import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const quarantineListOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type QuarantineListOptions = a.InferInput<typeof quarantineListOptionsSchema>
