import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const fido2FnEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    fido2_attrs: a.optional(a.record(a.string(), a.unknown())),
  }),
})

export type Fido2FnEditOptions = a.InferInput<typeof fido2FnEditOptionsSchema>
