import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const webauthnTfaRegistrationArgsGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type WebauthnTfaRegistrationArgsGetOptions = a.InferInput<typeof webauthnTfaRegistrationArgsGetOptionsSchema>
