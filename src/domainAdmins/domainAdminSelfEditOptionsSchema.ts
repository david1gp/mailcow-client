import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const domainAdminSelfEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    user_old_pass: a.optional(a.string()),
    user_new_pass: a.string(),
    user_new_pass2: a.string(),
  }),
})

export type DomainAdminSelfEditOptions = a.InferInput<typeof domainAdminSelfEditOptionsSchema>
