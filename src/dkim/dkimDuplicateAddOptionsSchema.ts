import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const dkimDuplicateAddOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    from_domain: a.string(),
    to_domain: a.union([a.string(), a.array(a.string())]),
  }),
})

export type DkimDuplicateAddOptions = a.InferInput<typeof dkimDuplicateAddOptionsSchema>
