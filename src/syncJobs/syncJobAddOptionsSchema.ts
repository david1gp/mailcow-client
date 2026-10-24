import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const syncJobAddOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    username: a.string(),
    host1: a.string(),
    port1: stringOrNumber,
    user1: a.string(),
    password1: a.string(),
    enc1: a.optional(a.string()),
    mins_interval: stringOrNumber,
    subfolder2: a.optional(a.string()),
    maxage: a.optional(stringOrNumber),
    maxbytespersecond: a.optional(stringOrNumber),
    timeout1: a.optional(stringOrNumber),
    timeout2: a.optional(stringOrNumber),
    exclude: a.optional(a.string()),
    custom_params: a.optional(a.string()),
    delete1: a.optional(stringOrNumber),
    delete2: a.optional(stringOrNumber),
    delete2duplicates: a.optional(stringOrNumber),
    automap: a.optional(stringOrNumber),
    skipcrossduplicates: a.optional(stringOrNumber),
    subscribeall: a.optional(stringOrNumber),
    dry: a.optional(stringOrNumber),
    active: a.optional(stringOrNumber),
  }),
})

export type SyncJobAddOptions = a.InferInput<typeof syncJobAddOptionsSchema>
