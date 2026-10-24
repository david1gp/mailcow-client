import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const domainPolicyAddOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    domain: a.string(),
    object_from: a.string(),
    object_list: a.picklist(["wl", "bl"]),
  }),
})

export type DomainPolicyAddOptions = a.InferInput<typeof domainPolicyAddOptionsSchema>
