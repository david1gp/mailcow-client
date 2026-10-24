import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const syncJobGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  mailbox: a.string(),
  fields: a.optional(a.array(a.string())),
})

export type SyncJobGetOptions = a.InferInput<typeof syncJobGetOptionsSchema>
