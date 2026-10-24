import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const ipCheckEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    ip_check_opt_in: a.optional(a.union([a.string(), a.number()])),
  }),
})

export type IpCheckEditOptions = a.InferInput<typeof ipCheckEditOptionsSchema>
