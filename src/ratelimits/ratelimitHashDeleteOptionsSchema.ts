import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const ratelimitHashDeleteOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.string()),
})

export type RatelimitHashDeleteOptions = a.InferInput<typeof ratelimitHashDeleteOptionsSchema>
