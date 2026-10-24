import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const relayhostAddOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    hostname: a.string(),
    username: a.optional(a.string()),
    password: a.optional(a.string()),
  }),
})

export type RelayhostAddOptions = a.InferInput<typeof relayhostAddOptionsSchema>
