import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const filterEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
  attr: a.looseObject({
    active: a.optional(stringOrNumber),
    script_desc: a.optional(a.string()),
    script_data: a.optional(a.string()),
    // Same `prefilter|postfilter` restriction as add
    // (`functions.mailbox.inc.php:2524-2532`); omitted falls back to current.
    filter_type: a.optional(a.picklist(["prefilter", "postfilter"])),
  }),
})

export type FilterEditOptions = a.InferInput<typeof filterEditOptionsSchema>
