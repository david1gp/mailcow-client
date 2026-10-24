import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const aliasDomainGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  domain: a.string(),
})

export type AliasDomainGetOptions = a.InferInput<typeof aliasDomainGetOptionsSchema>
