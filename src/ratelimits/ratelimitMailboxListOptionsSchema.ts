import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const ratelimitMailboxListOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type RatelimitMailboxListOptions = a.InferInput<typeof ratelimitMailboxListOptionsSchema>
