import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const bccEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
  attr: a.looseObject({
    type: a.optional(a.picklist(["sender", "rcpt"])),
    local_dest: a.optional(a.string()),
    bcc_dest: a.optional(a.string()),
    active: a.optional(stringOrNumber),
  }),
})

export type BccEditOptions = a.InferInput<typeof bccEditOptionsSchema>
