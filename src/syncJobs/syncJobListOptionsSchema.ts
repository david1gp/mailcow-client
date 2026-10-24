import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const syncJobListOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type SyncJobListOptions = a.InferInput<typeof syncJobListOptionsSchema>
