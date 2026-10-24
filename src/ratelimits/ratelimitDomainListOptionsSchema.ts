import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const ratelimitDomainListOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type RatelimitDomainListOptions = a.InferInput<typeof ratelimitDomainListOptionsSchema>
