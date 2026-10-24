import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const ratelimitMailboxEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
  attr: a.looseObject({
    rl_value: a.optional(stringOrNumber),
    rl_frame: a.optional(a.picklist(["s", "m", "h", "d"])),
  }),
})

export type RatelimitMailboxEditOptions = a.InferInput<typeof ratelimitMailboxEditOptionsSchema>
