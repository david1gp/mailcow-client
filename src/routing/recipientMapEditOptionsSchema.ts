import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const recipientMapEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
  attr: a.looseObject({
    recipient_map_old: a.optional(a.string()),
    recipient_map_new: a.optional(a.string()),
    active: a.optional(stringOrNumber),
  }),
})

export type RecipientMapEditOptions = a.InferInput<typeof recipientMapEditOptionsSchema>
