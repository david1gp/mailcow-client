import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const transportAddOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    destination: a.string(),
    nexthop: a.string(),
    username: a.optional(a.string()),
    password: a.optional(a.string()),
    is_mx_based: a.optional(stringOrNumber),
    active: a.optional(stringOrNumber),
  }),
})

export type TransportAddOptions = a.InferInput<typeof transportAddOptionsSchema>
