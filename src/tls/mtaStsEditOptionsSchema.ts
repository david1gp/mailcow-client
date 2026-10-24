import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const mtaStsEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.string()),
  attr: a.looseObject({
    mode: a.optional(a.string()),
    max_age: a.optional(stringOrNumber),
    mx: a.optional(a.string()),
    // Omitted falls back to the current version upstream
    // (`functions.mailbox.inc.php:4002`); when given only stsv1 is valid
    // (`functions.mailbox.inc.php:4025-4031`).
    version: a.optional(a.picklist(["stsv1"])),
    active: a.optional(stringOrNumber),
  }),
})

export type MtaStsEditOptions = a.InferInput<typeof mtaStsEditOptionsSchema>
