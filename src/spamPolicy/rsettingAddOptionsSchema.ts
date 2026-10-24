import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const rsettingAddOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    content: a.string(),
    desc: a.optional(a.string()),
    active: a.optional(stringOrNumber),
  }),
})

export type RsettingAddOptions = a.InferInput<typeof rsettingAddOptionsSchema>
