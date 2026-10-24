import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const webauthnTfaGetArgsGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type WebauthnTfaGetArgsGetOptions = a.InferInput<typeof webauthnTfaGetArgsGetOptionsSchema>
