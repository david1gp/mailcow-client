import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const identityProviderDeleteOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type IdentityProviderDeleteOptions = a.InferInput<typeof identityProviderDeleteOptionsSchema>
