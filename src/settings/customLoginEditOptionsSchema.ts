import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const customLoginEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    hide_user_quicklink: a.optional(stringOrNumber),
    hide_domainadmin_quicklink: a.optional(stringOrNumber),
    hide_admin_quicklink: a.optional(stringOrNumber),
    force_sso: a.optional(stringOrNumber),
  }),
})

export type CustomLoginEditOptions = a.InferInput<typeof customLoginEditOptionsSchema>
