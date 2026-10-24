import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const mtaStsAddOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    domain: a.string(),
    // Upstream rejects empty or non-stsv1 versions (`version_invalid`,
    // `functions.mailbox.inc.php:1476-1482`).
    version: a.picklist(["stsv1"]),
    mode: a.optional(a.string()),
    max_age: a.optional(stringOrNumber),
    mx: a.optional(a.string()),
    active: a.optional(stringOrNumber),
  }),
})

export type MtaStsAddOptions = a.InferInput<typeof mtaStsAddOptionsSchema>
