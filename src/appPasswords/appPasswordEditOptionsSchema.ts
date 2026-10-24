import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"
import { appPasswordProtocolSchema } from "./appPasswordProtocol.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const appPasswordEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
  attr: a.looseObject({
    // Upstream resolves the target mailbox from attr.username and falls back
    // to the session user (`functions.app_passwd.inc.php:8-22`) — for API-key
    // callers that fallback is the pseudo-user "API", under which the edit
    // cannot apply (and the row's mailbox would be reassigned to "API").
    username: a.string(),
    app_name: a.optional(a.string()),
    app_passwd: a.optional(a.string()),
    app_passwd2: a.optional(a.string()),
    active: a.optional(stringOrNumber),
    protocols: a.optional(a.array(appPasswordProtocolSchema)),
  }),
})

export type AppPasswordEditOptions = a.InferInput<typeof appPasswordEditOptionsSchema>
