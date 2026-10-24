import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const fido2RegistrationAddOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  clientDataJSON: a.string(),
  attestationObject: a.string(),
})

export type Fido2RegistrationAddOptions = a.InferInput<typeof fido2RegistrationAddOptionsSchema>
