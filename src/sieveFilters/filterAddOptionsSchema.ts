import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const filterAddOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    username: a.string(),
    // Upstream accepts only prefilter|postfilter (`invalid_filter_type`
    // otherwise, `functions.mailbox.inc.php:271-279`).
    filter_type: a.picklist(["prefilter", "postfilter"]),
    script_data: a.string(),
    script_desc: a.optional(a.string()),
    active: a.optional(stringOrNumber),
  }),
})

export type FilterAddOptions = a.InferInput<typeof filterAddOptionsSchema>
