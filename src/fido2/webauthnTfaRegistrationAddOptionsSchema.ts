import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const webauthnTfaRegistrationAddOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  clientDataJSON: a.string(),
  attestationObject: a.string(),
  tfa_method: a.optional(a.string()),
  key_id: a.optional(a.string()),
  confirm_password: a.optional(a.string()),
})

export type WebauthnTfaRegistrationAddOptions = a.InferInput<typeof webauthnTfaRegistrationAddOptionsSchema>
