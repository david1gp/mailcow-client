import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const domainAdminAddOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    username: a.string(),
    password: a.string(),
    password2: a.string(),
    domains: a.array(a.string()),
    active: a.optional(stringOrNumber),
  }),
})

export type DomainAdminAddOptions = a.InferInput<typeof domainAdminAddOptionsSchema>
