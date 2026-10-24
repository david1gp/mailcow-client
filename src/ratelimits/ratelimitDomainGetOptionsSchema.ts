import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const ratelimitDomainGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  domain: a.string(),
})

export type RatelimitDomainGetOptions = a.InferInput<typeof ratelimitDomainGetOptionsSchema>
