import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const fail2banEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
  attr: a.looseObject({
    ban_time: a.optional(stringOrNumber),
    ban_time_increment: a.optional(stringOrNumber),
    max_ban_time: a.optional(stringOrNumber),
    netban_ipv4: a.optional(stringOrNumber),
    netban_ipv6: a.optional(stringOrNumber),
    max_attempts: a.optional(stringOrNumber),
    retry_window: a.optional(stringOrNumber),
    whitelist: a.optional(a.string()),
    blacklist: a.optional(a.string()),
    regex: a.optional(a.string()),
    manage_external: a.optional(stringOrNumber),
  }),
})

export type Fail2banEditOptions = a.InferInput<typeof fail2banEditOptionsSchema>
