import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const fail2banBanlistEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
})

export type Fail2banBanlistEditOptions = a.InferInput<typeof fail2banBanlistEditOptionsSchema>
