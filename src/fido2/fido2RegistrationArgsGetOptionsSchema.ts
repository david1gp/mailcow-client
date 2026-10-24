import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const fido2RegistrationArgsGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type Fido2RegistrationArgsGetOptions = a.InferInput<typeof fido2RegistrationArgsGetOptionsSchema>
