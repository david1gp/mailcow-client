import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const quarantineSettingsEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    sender: a.optional(a.string()),
    subject: a.optional(a.string()),
    html_tmpl: a.optional(a.string()),
    retention_size: a.optional(stringOrNumber),
    max_size: a.optional(stringOrNumber),
    max_age: a.optional(stringOrNumber),
    max_score: a.optional(stringOrNumber),
    release_format: a.optional(a.picklist(["attachment", "raw"])),
    bcc: a.optional(a.string()),
    redirect: a.optional(a.string()),
    exclude_domains: a.optional(a.array(a.string())),
  }),
})

export type QuarantineSettingsEditOptions = a.InferInput<typeof quarantineSettingsEditOptionsSchema>
