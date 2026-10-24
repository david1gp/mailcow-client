import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const rsettingEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
  attr: a.looseObject({
    content: a.optional(a.string()),
    desc: a.optional(a.string()),
    active: a.optional(stringOrNumber),
  }),
})

export type RsettingEditOptions = a.InferInput<typeof rsettingEditOptionsSchema>
