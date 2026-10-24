import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const dkimAddOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    domains: a.string(),
    dkim_selector: a.optional(a.string()),
    key_size: a.optional(stringOrNumber),
  }),
})

export type DkimAddOptions = a.InferInput<typeof dkimAddOptionsSchema>
