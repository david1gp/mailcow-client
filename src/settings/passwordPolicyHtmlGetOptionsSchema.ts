import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const passwordPolicyHtmlGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type PasswordPolicyHtmlGetOptions = a.InferInput<typeof passwordPolicyHtmlGetOptionsSchema>
