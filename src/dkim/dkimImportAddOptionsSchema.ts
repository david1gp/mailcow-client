import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const dkimImportAddOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    domain: a.string(),
    private_key_file: a.string(),
    dkim_selector: a.optional(a.string()),
    overwrite_existing: a.optional(stringOrNumber),
  }),
})

export type DkimImportAddOptions = a.InferInput<typeof dkimImportAddOptionsSchema>
