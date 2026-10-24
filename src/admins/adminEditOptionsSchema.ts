import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const adminEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
  attr: a.looseObject({
    active: a.optional(stringOrNumber),
    username_new: a.optional(a.string()),
    password: a.optional(a.string()),
    password2: a.optional(a.string()),
    force_pw_update: a.optional(stringOrNumber),
    force_tfa: a.optional(stringOrNumber),
  }),
})

export type AdminEditOptions = a.InferInput<typeof adminEditOptionsSchema>
