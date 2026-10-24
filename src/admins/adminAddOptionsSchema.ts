import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const adminAddOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    username: a.string(),
    password: a.string(),
    password2: a.string(),
    active: a.optional(stringOrNumber),
  }),
})

export type AdminAddOptions = a.InferInput<typeof adminAddOptionsSchema>
