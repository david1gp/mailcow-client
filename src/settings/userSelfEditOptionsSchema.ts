import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const userSelfEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    user_old_pass: a.optional(a.string()),
    user_new_pass: a.optional(a.string()),
    user_new_pass2: a.optional(a.string()),
    pw_recovery_email: a.optional(a.string()),
  }),
})

export type UserSelfEditOptions = a.InferInput<typeof userSelfEditOptionsSchema>
