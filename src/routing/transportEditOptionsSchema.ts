import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const transportEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
  attr: a.looseObject({
    destination: a.optional(a.string()),
    nexthop: a.optional(a.string()),
    username: a.optional(a.string()),
    password: a.optional(a.string()),
    is_mx_based: a.optional(stringOrNumber),
    active: a.optional(stringOrNumber),
  }),
})

export type TransportEditOptions = a.InferInput<typeof transportEditOptionsSchema>
