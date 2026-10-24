import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

/** Attr fields for `POST /add/global-filter` (`functions.mailbox.inc.php:96-`). */
export const globalFilterAddOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    filter_type: a.picklist(["prefilter", "postfilter"]),
    script_data: a.string(),
  }),
})

export type GlobalFilterAddOptions = a.InferInput<typeof globalFilterAddOptionsSchema>
