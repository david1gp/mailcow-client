import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const recipientMapAddOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    recipient_map_old: a.string(),
    recipient_map_new: a.string(),
    active: a.optional(stringOrNumber),
  }),
})

export type RecipientMapAddOptions = a.InferInput<typeof recipientMapAddOptionsSchema>
