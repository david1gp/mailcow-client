import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const identityProviderTestEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({}),
})

export type IdentityProviderTestEditOptions = a.InferInput<typeof identityProviderTestEditOptionsSchema>
