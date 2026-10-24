import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const bccAddOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    type: a.picklist(["sender", "rcpt"]),
    local_dest: a.string(),
    bcc_dest: a.string(),
    active: a.optional(stringOrNumber),
  }),
})

export type BccAddOptions = a.InferInput<typeof bccAddOptionsSchema>
