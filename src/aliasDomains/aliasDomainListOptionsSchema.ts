import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const aliasDomainListOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type AliasDomainListOptions = a.InferInput<typeof aliasDomainListOptionsSchema>
