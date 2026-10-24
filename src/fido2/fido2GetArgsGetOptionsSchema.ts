import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const fido2GetArgsGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type Fido2GetArgsGetOptions = a.InferInput<typeof fido2GetArgsGetOptionsSchema>
