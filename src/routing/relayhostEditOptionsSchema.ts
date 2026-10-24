import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const relayhostEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
  attr: a.looseObject({
    hostname: a.optional(a.string()),
    username: a.optional(a.string()),
    password: a.optional(a.string()),
    active: a.optional(stringOrNumber),
  }),
})

export type RelayhostEditOptions = a.InferInput<typeof relayhostEditOptionsSchema>
