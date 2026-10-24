import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"
import { appPasswordProtocolSchema } from "./appPasswordProtocol.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const appPasswordAddOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    username: a.string(),
    app_name: a.string(),
    app_passwd: a.string(),
    app_passwd2: a.string(),
    active: a.optional(stringOrNumber),
    protocols: a.optional(a.array(appPasswordProtocolSchema)),
  }),
})

export type AppPasswordAddOptions = a.InferInput<typeof appPasswordAddOptionsSchema>
