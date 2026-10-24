import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const passwordPolicyGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type PasswordPolicyGetOptions = a.InferInput<typeof passwordPolicyGetOptionsSchema>
