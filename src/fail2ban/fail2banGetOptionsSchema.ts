import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const fail2banGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type Fail2banGetOptions = a.InferInput<typeof fail2banGetOptionsSchema>
